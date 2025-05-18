
import requests
import sys
import os
from datetime import datetime

class StripeIntegrationTester:
    def __init__(self, base_url="https://6a357df8-fffa-4695-b5a4-2ce00a730b96.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

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
                    return success, {"message": "No JSON response"}
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

    def test_create_payment_intent(self, amount=2500):
        """Test creating a payment intent"""
        return self.run_test(
            "Create Payment Intent",
            "POST",
            "create-payment-intent",
            200,
            data={"amount": amount}
        )

    def test_create_checkout_session(self, amount=2500):
        """Test creating a checkout session"""
        return self.run_test(
            "Create Checkout Session",
            "POST",
            "create-checkout-session",
            200,
            data={"amount": amount}
        )

    def test_create_subscription(self, plan_id="tree_guardian"):
        """Test creating a subscription"""
        return self.run_test(
            "Create Subscription",
            "POST",
            "create-subscription",
            200,
            data={"plan": plan_id}
        )
    
    def test_get_stripe_config(self):
        """Test getting the Stripe configuration"""
        return self.run_test(
            "Get Stripe Config",
            "GET",
            "stripe-config",
            200
        )

def main():
    print(f"Testing Stripe Integration at: https://6a357df8-fffa-4695-b5a4-2ce00a730b96.preview.emergentagent.com\n")
    
    # Setup
    tester = StripeIntegrationTester()
    
    # Test Stripe configuration
    success, response = tester.test_get_stripe_config()
    if success:
        print(f"Stripe Mode: {response.get('mode', 'unknown')}")
    
    # Test payment intent creation
    tester.test_create_payment_intent()
    
    # Test checkout session creation
    tester.test_create_checkout_session()
    
    # Test subscription creation
    tester.test_create_subscription()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.tests_passed < tester.tests_run:
        print("\n⚠️ Some Stripe tests failed. This may indicate an issue with the Stripe API key.")
        print("   Check that the STRIPE_SECRET_KEY environment variable is set correctly.")
        print("   The key should be a valid Stripe API key starting with 'sk_test_' or 'sk_live_'.")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
