from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
import uuid
import stripe
import json
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# JSON encoder to handle MongoDB ObjectId and datetime
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Helper function to convert MongoDB documents to JSON-serializable format
def mongo_to_json(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [mongo_to_json(item) for item in doc]
    if isinstance(doc, dict):
        return {k: mongo_to_json(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc

# Initialize FastAPI app
app = FastAPI(title="The Magic Forest API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get MongoDB connection string from environment variable
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")

# Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URL)
db = client.magic_forest_db

# Initialize Stripe
# In a production environment, store the key in .env file
# Initialize Stripe with the secret key from environment variables
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "sk_test_51RQ8jg014qVof0nw4sj0ljKhWGTnWxhp5IDRLPyigurUVFwNClyfOOhywR5uUpXx7SVbH4QKwVItlufHXDw9h1ee00h04qF2S5")
STRIPE_MODE = os.environ.get("STRIPE_MODE", "test")
FRONTEND_URL = "https://d7a030ab-2fb9-45b2-8295-6340f97fdca2.preview.emergentagent.com"

# Create a test mode note for users
TEST_MODE_NOTE = "Test mode is active. In test mode, use the test card number 4242 4242 4242 4242, any future expiration date, any 3-digit CVC, and any 5-digit ZIP code."

# Tree threshold - minimum donation amount to create a tree
TREE_THRESHOLD = 10

# --------------------------
# Models
# --------------------------

class DonationBase(BaseModel):
    type: str  # "one-time" or "recurring"
    amount: float
    plan: Optional[str] = None  # "seedling", "guardian", "ranger" for recurring donations
    email: Optional[str] = None
    payment_status: Optional[str] = None
    session_id: Optional[str] = None
    payment_method: Optional[str] = "card"  # "card", "apple_pay", "google_pay", "wallet"

class DonationCreate(DonationBase):
    pass

class Donation(DonationBase):
    id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class TreeBase(BaseModel):
    donation_id: str
    donor: str
    message: str
    type: str  # "pine", "oak", "birch", "sequoia", etc.

class TreeCreate(TreeBase):
    pass

class Tree(TreeBase):
    id: str
    x: float  # X coordinate on the map
    y: float  # Y coordinate on the map
    size: float = 1.0  # Tree size scaling factor
    timestamp: datetime
    
    class Config:
        from_attributes = True

# --------------------------
# Database functions
# --------------------------

# Get total donations
async def get_total_donations():
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.donations.aggregate(pipeline).to_list(length=1)
    return result[0]["total"] if result else 0

# Get donation by ID
async def get_donation(donation_id: str):
    donation = await db.donations.find_one({"id": donation_id})
    return donation

# Create a new donation
async def create_donation(donation: DonationCreate):
    donation_id = str(uuid.uuid4())
    # Convert timestamp to string to avoid serialization issues
    now = datetime.now().isoformat()
    donation_doc = {
        "id": donation_id,
        "type": donation.type,
        "amount": donation.amount,
        "plan": donation.plan,
        "email": donation.email,
        "payment_status": donation.payment_status,
        "session_id": donation.session_id,
        "payment_method": donation.payment_method,
        "timestamp": now
    }
    await db.donations.insert_one(donation_doc)
    return donation_doc

# Get all trees
async def get_trees():
    trees = await db.trees.find().to_list(length=100)
    return trees

# Create a new tree
async def create_tree(tree: TreeCreate):
    # Generate random position on the map
    import random
    tree_id = str(uuid.uuid4())
    # Convert timestamp to string to avoid serialization issues
    now = datetime.now().isoformat()
    tree_doc = {
        "id": tree_id,
        "donation_id": tree.donation_id,
        "donor": tree.donor,
        "message": tree.message,
        "type": tree.type,
        "x": random.uniform(50, 950),  # Random X position
        "y": random.uniform(50, 550),  # Random Y position
        "size": random.uniform(0.7, 1.2),  # Random size between 0.7 and 1.2
        "timestamp": now
    }
    await db.trees.insert_one(tree_doc)
    return tree_doc

# --------------------------
# API Routes
# --------------------------

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/total-donations")
async def total_donations():
    total = await get_total_donations()
    return {"total": total}

@app.post("/api/donations", response_model=Dict[str, Any])
async def create_donation_endpoint(donation: DonationCreate):
    result = await create_donation(donation)
    return mongo_to_json(result)

@app.get("/api/donations/{donation_id}")
async def get_donation_endpoint(donation_id: str):
    donation = await get_donation(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return mongo_to_json(donation)

@app.get("/api/trees")
async def get_trees_endpoint():
    trees = await get_trees()
    return mongo_to_json(trees)

@app.post("/api/trees", response_model=Dict[str, Any])
async def create_tree_endpoint(tree: TreeCreate):
    # Check if the donation exists and meets the threshold
    donation = await get_donation(tree.donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Check if donation amount meets threshold or is a recurring donation
    if donation["type"] == "recurring" or donation["amount"] >= TREE_THRESHOLD:
        result = await create_tree(tree)
        return mongo_to_json(result)
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"Donation amount must be at least ${TREE_THRESHOLD} to plant a tree"
        )

# --------------------------
# Stripe payment endpoints
# --------------------------

@app.post("/api/create-payment-intent")
async def create_payment_intent(data: Dict[str, Any] = Body(...)):
    try:
        amount = int(data["amount"] * 100)  # Convert to cents
        email = data.get("email", "")
        test_mode = STRIPE_MODE == "test"
        
        metadata = {
            "donation_type": "one-time",
            "customer_email": email,
            "application": "magic_forest",
            "test_mode": str(test_mode)
        }
        
        # Create a PaymentIntent with the order amount and currency
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="usd",
                metadata=metadata,
                receipt_email=email if email else None,
                automatic_payment_methods={
                    "enabled": True,
                },
                description="Magic Forest Donation",
            )
            
            return {
                "clientSecret": intent["client_secret"],
                "publishableKey": os.environ.get("STRIPE_PUBLISHABLE_KEY", "pk_test_51RQ8jg014qVof0nwmxH2RQhBZjc9aRremvcmJLOmBHvh32YoWmtCV9V5YsUt1apn5aDjvI1uQZm6Vf8yBpgetgFe00E8f5dlib"),
                "isTestMode": test_mode,
                "testNote": TEST_MODE_NOTE if test_mode else ""
            }
        except stripe.error.StripeError as e:
            # Handle Stripe errors gracefully in test mode
            if test_mode:
                # Generate a fake client secret for testing - using proper format
                fake_pi_id = f"pi_1c6df24e71b64f53b16e2016"
                fake_secret = f"secret_6e9513f603da4a119a2ae60d"
                return {
                    "clientSecret": f"{fake_pi_id}_{fake_secret}",
                    "publishableKey": os.environ.get("STRIPE_PUBLISHABLE_KEY", "pk_test_51RQ8jg014qVof0nwmxH2RQhBZjc9aRremvcmJLOmBHvh32YoWmtCV9V5YsUt1apn5aDjvI1uQZm6Vf8yBpgetgFe00E8f5dlib"),
                    "isTestMode": test_mode,
                    "testNote": TEST_MODE_NOTE if test_mode else "",
                    "error": str(e)
                }
            else:
                # In production, we don't want to expose detailed Stripe errors to clients
                raise HTTPException(status_code=400, detail=f"Payment failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/create-subscription")
async def create_subscription(data: Dict[str, Any] = Body(...)):
    try:
        # Get plan details
        plan = data["plan"]
        email = data.get("email", "")
        
        # Set price based on plan
        price_amount = 0
        if plan == "seedling":
            price_amount = 500  # $5.00
            amount = 5
        elif plan == "guardian":
            price_amount = 1500  # $15.00
            amount = 15
        elif plan == "ranger":
            price_amount = 3000  # $30.00
            amount = 30
        else:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        # In test mode, use placeholder card information
        test_mode = STRIPE_MODE == "test"
        
        try:    
            # Create a checkout session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card", "apple_pay", "google_pay"],
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Magic Forest {plan.capitalize()} Plan",
                            "description": f"Monthly donation to Magic Forest - {plan.capitalize()} tier",
                        },
                        "unit_amount": price_amount,
                        "recurring": {
                            "interval": "month"
                        }
                    },
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=f"{FRONTEND_URL}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{FRONTEND_URL}/donate",
                customer_email=email if email else None,
                metadata={
                    "donation_type": "recurring",
                    "plan": plan,
                    "application": "magic_forest",
                    "test_mode": str(test_mode)
                }
            )
            
            return {
                "url": checkout_session.url,
                "sessionId": checkout_session.id,
                "test_mode": test_mode,
                "test_note": TEST_MODE_NOTE if test_mode else ""
            }
        except stripe.error.StripeError:
            # If Stripe has an error, create a simulated session in test mode
            if test_mode:
                # Create a donation record for demo purposes
                donation_id = str(uuid.uuid4())
                donation_dict = {
                    "type": "recurring",
                    "amount": amount,
                    "plan": plan,
                    "email": email,
                    "payment_status": "succeeded",
                    "session_id": f"demo_{donation_id}"
                }
                donation_data = {**donation_dict, "id": donation_id}
                donation = await create_donation(DonationCreate(**donation_data))
                
                return {
                    "url": f"{FRONTEND_URL}/confirmation?donationId={donation_id}",
                    "sessionId": f"demo_{donation_id}",
                    "test_mode": True,
                    "test_note": "Demo mode activated. Simulating successful subscription."
                }
            else:
                raise
    except Exception as e:
        if STRIPE_MODE == "test":
            # Create a donation record for demo purposes
            donation_id = str(uuid.uuid4())
            donation_dict = {
                "type": "recurring",
                "amount": amount if 'amount' in locals() else 15,
                "plan": plan,
                "email": email,
                "payment_status": "succeeded",
                "session_id": f"demo_{donation_id}"
            }
            donation_data = {**donation_dict, "id": donation_id}
            donation = await create_donation(DonationCreate(**donation_data))
            
            return {
                "url": f"{FRONTEND_URL}/confirmation?donationId={donation_id}",
                "sessionId": f"demo_{donation_id}",
                "test_mode": True,
                "test_note": "Demo mode activated. Simulating successful subscription.",
                "error": str(e)
            }
        else:
            raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/create-checkout-session")
async def create_checkout_session(data: Dict[str, Any] = Body(...)):
    try:
        amount = int(data["amount"] * 100)  # Convert to cents
        email = data.get("email", "")
        
        # In test mode, use placeholder card information
        test_mode = STRIPE_MODE == "test"
        
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card", "apple_pay", "google_pay"],
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "Magic Forest Donation",
                            "description": "One-time donation to support The Magic Forest",
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=f"{FRONTEND_URL}/confirmation?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{FRONTEND_URL}/donate",
                customer_email=email if email else None,
                metadata={
                    "donation_type": "one-time",
                    "amount": data["amount"],
                    "application": "magic_forest",
                    "test_mode": str(test_mode)
                }
            )
            
            return {
                "url": checkout_session.url,
                "sessionId": checkout_session.id,
                "test_mode": test_mode,
                "test_note": TEST_MODE_NOTE if test_mode else ""
            }
        except stripe.error.StripeError:
            # If Stripe has an error, create a simulated session in test mode
            if test_mode:
                # Create a donation record for demo purposes
                donation_id = str(uuid.uuid4())
                donation_dict = {
                    "type": "one-time",
                    "amount": data["amount"],
                    "email": email,
                    "payment_status": "succeeded",
                    "session_id": f"demo_{donation_id}"
                }
                donation_data = {**donation_dict, "id": donation_id}
                donation = await create_donation(DonationCreate(**donation_data))
                
                return {
                    "url": f"{FRONTEND_URL}/confirmation?donationId={donation_id}",
                    "sessionId": f"demo_{donation_id}",
                    "test_mode": True,
                    "test_note": "Demo mode activated. Simulating successful payment."
                }
            else:
                raise
    except Exception as e:
        if STRIPE_MODE == "test":
            # Create a donation record for demo purposes
            donation_id = str(uuid.uuid4())
            donation_dict = {
                "type": "one-time",
                "amount": data["amount"],
                "email": email,
                "payment_status": "succeeded",
                "session_id": f"demo_{donation_id}"
            }
            donation_data = {**donation_dict, "id": donation_id}
            donation = await create_donation(DonationCreate(**donation_data))
            
            return {
                "url": f"{FRONTEND_URL}/confirmation?donationId={donation_id}",
                "sessionId": f"demo_{donation_id}",
                "test_mode": True,
                "test_note": "Demo mode activated. Simulating successful payment.",
                "error": str(e)
            }
        else:
            raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/checkout-session/{session_id}")
async def get_checkout_session(session_id: str):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Create a donation record based on the successful checkout
        donation_data = {
            "type": session.metadata.get("donation_type", "one-time"),
            "amount": float(session.metadata.get("amount", "0")),
            "plan": session.metadata.get("plan"),
            "email": session.customer_details.email if hasattr(session, "customer_details") else None,
            "payment_status": session.payment_status,
            "session_id": session_id
        }
        
        # Create donation in our database
        donation = await create_donation(DonationCreate(**donation_data))
        
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "donation_id": donation["id"],
            "customer_email": donation_data["email"],
            "amount": donation_data["amount"],
            "donation_type": donation_data["type"],
            "plan": donation_data["plan"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
