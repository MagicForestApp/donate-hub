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
# Using Stripe test mode with a dummy key since we're not making real charges yet
stripe.api_key = "sk_test_51O9SjXHfUPLCHsI9OUafaapwpDRJ6yRwK7dtHs5IYa5O9VkBvt5PuOHJQ4FC68Ycm0z1qlGZJcCrbVqRUvlnaMtp006SYdkSbA"  # Test key

# Tree threshold - minimum donation amount to create a tree
TREE_THRESHOLD = 10

# --------------------------
# Models
# --------------------------

class DonationBase(BaseModel):
    type: str  # "one-time" or "recurring"
    amount: float
    plan: Optional[str] = None  # "seedling", "guardian", "ranger" for recurring donations

class DonationCreate(DonationBase):
    pass

class Donation(DonationBase):
    id: str
    timestamp: datetime
    
    class Config:
        orm_mode = True

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
    timestamp: datetime
    
    class Config:
        orm_mode = True

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
        
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            automatic_payment_methods={
                "enabled": True,
            },
        )
        
        return {"clientSecret": intent["client_secret"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/create-subscription")
async def create_subscription(data: Dict[str, Any] = Body(...)):
    try:
        # Get plan price based on tier
        plan = data["plan"]
        price_id = ""
        
        # In a real app, these would be actual Stripe price IDs
        if plan == "seedling":
            price_id = "price_seedling"
        elif plan == "guardian":
            price_id = "price_guardian"
        elif plan == "ranger":
            price_id = "price_ranger"
        else:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        # Create a subscription
        # Note: In a real implementation, you would create a customer and subscribe them
        # This is a simplified version
        
        return {"success": True, "message": "Subscription created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
