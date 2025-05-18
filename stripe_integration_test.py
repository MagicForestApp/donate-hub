
import requests
import sys
import json
import os
from datetime import datetime

class StripeIntegrationTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.donation_id = None
        self.tree_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_create_payment_intent(self, amount=25):
        """Test creating a payment intent"""
        data = {
            "amount": amount
        }
        
        success, response = self.run_test(
            "Create Payment Intent",
            "POST",
            "api/create-payment-intent",
            200,
            data=data
        )
        
        if success and 'clientSecret' in response:
            print("Payment intent created successfully")
            print(f"Client Secret: {response['clientSecret'][:10]}...")
            print(f"Publishable Key: {response.get('publishableKey', 'Not provided')}")
            print(f"Test Mode: {response.get('isTestMode', 'Not specified')}")
        
        return success

    def test_create_checkout_session(self, amount=25, email="test@example.com"):
        """Test creating a one-time checkout session"""
        data = {
            "amount": amount,
            "email": email
        }
        
        success, response = self.run_test(
            "Create One-Time Checkout Session",
            "POST",
            "api/create-checkout-session",
            200,
            data=data
        )
        
        if success and 'url' in response:
            print("Checkout session created successfully")
            print(f"Checkout URL: {response['url']}")
            print(f"Session ID: {response.get('sessionId', 'Not provided')}")
        
        return success

    def test_create_subscription(self, plan="guardian", email="test@example.com"):
        """Test creating a subscription"""
        data = {
            "plan": plan,
            "email": email
        }
        
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "api/create-subscription",
            200,
            data=data
        )
        
        if success and 'url' in response:
            print("Subscription session created successfully")
            print(f"Subscription URL: {response['url']}")
            print(f"Session ID: {response.get('sessionId', 'Not provided')}")
        
        return success

    def test_checkout_session(self, session_id="cs_test_example"):
        """Test retrieving a checkout session"""
        success, response = self.run_test(
            "Get Checkout Session",
            "GET",
            f"api/checkout-session/{session_id}",
            200
        )
        
        if success:
            print("Checkout session retrieved successfully")
            print(f"Donation ID: {response.get('donation_id', 'Not provided')}")
            print(f"Payment Status: {response.get('payment_status', 'Not provided')}")
        
        return success

def main():
    # Read the backend URL from the frontend .env file
    backend_url = None
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.strip().split('=')[1].strip('"')
                    break
    except Exception as e:
        print(f"Error reading .env file: {e}")
    
    # Fallback to default if not found
    if not backend_url:
        backend_url = "http://localhost:8001"
    
    print(f"Testing Stripe Integration at: {backend_url}")
    
    # Setup tester
    tester = StripeIntegrationTester(backend_url)
    
    # Run tests
    tests_to_run = [
        tester.test_create_payment_intent,
        lambda: tester.test_create_checkout_session(amount=25, email="test@example.com"),
        lambda: tester.test_create_subscription(plan="guardian", email="test@example.com"),
        # Skip checkout session test as we don't have a valid session ID
        # lambda: tester.test_checkout_session(session_id="cs_test_example")
    ]
    
    for test in tests_to_run:
        test()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Check for Stripe API key issues
    if tester.tests_passed == 0:
        print("\n⚠️ All Stripe tests failed. This may indicate an issue with the Stripe API key.")
        print("   Check that the STRIPE_SECRET_KEY environment variable is set correctly.")
        print("   The key should be a valid Stripe API key starting with 'sk_test_' or 'sk_live_'.")
    
    # Return success if all tests passed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
