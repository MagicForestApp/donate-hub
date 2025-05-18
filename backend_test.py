
import requests
import sys
import json
from datetime import datetime

class MagicForestAPITester:
    def __init__(self, base_url="https://6a357df8-fffa-4695-b5a4-2ce00a730b96.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
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
                    error_data = response.json()
                    print(f"Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_create_payment_intent(self, amount=25, email="test@example.com"):
        """Test creating a payment intent for a one-time donation"""
        success, response = self.run_test(
            "Create Payment Intent",
            "POST",
            "create-payment-intent",
            200,
            data={"amount": amount, "email": email}
        )
        
        if success:
            print(f"Client Secret: {response.get('clientSecret', 'Not found')[:10]}...")
            print(f"Test Mode: {response.get('isTestMode', 'Not found')}")
            print(f"Test Note: {response.get('testNote', 'Not found')[:30]}...")
        
        return success, response

    def test_create_donation(self, amount=25, email="test@example.com", session_id="test_session_123"):
        """Test creating a donation record"""
        success, response = self.run_test(
            "Create Donation",
            "POST",
            "donations",
            200,
            data={
                "type": "one-time",
                "amount": amount,
                "email": email,
                "payment_status": "succeeded",
                "session_id": session_id
            }
        )
        
        if success:
            print(f"Donation ID: {response.get('id', 'Not found')}")
        
        return success, response

    def test_create_subscription(self, plan="seedling", email="test@example.com"):
        """Test creating a subscription checkout session"""
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "create-subscription",
            200,
            data={"plan": plan, "email": email}
        )
        
        if success:
            print(f"Session URL: {response.get('url', 'Not found')[:30]}...")
        
        return success, response

def main():
    # Setup
    tester = MagicForestAPITester()
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
    
    # Run tests
    print(f"Testing Stripe Integration at: {tester.base_url}")
    
    # Test creating a payment intent
    payment_intent_success, payment_intent_data = tester.test_create_payment_intent(
        amount=25,
        email=test_email
    )
    
    # Test creating a donation
    donation_success, donation_data = tester.test_create_donation(
        amount=25,
        email=test_email,
        session_id=f"test_session_{datetime.now().strftime('%H%M%S')}"
    )
    
    # Test creating a subscription
    subscription_success, subscription_data = tester.test_create_subscription(
        plan="seedling",
        email=test_email
    )
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
