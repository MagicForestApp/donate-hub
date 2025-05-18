#!/usr/bin/env python
import requests
import sys
import json
from datetime import datetime

class MagicForestAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
    
    def run_test(self, test_name, method, endpoint, expected_status, data=None):
        self.tests_run += 1
        url = f"{self.base_url}/api/{endpoint}"
        
        print(f"\n🧪 Testing: {test_name}")
        print(f"  URL: {url}")
        if data:
            print(f"  Data: {json.dumps(data)[:100]}...")
        
        try:
            if method.upper() == "GET":
                response = requests.get(url)
            elif method.upper() == "POST":
                response = requests.post(url, json=data)
            else:
                print(f"❌ Failed - Unsupported method: {method}")
                return False, {}
            
            print(f"  Status: {response.status_code} (Expected: {expected_status})")
            
            if response.status_code != expected_status:
                print(f"❌ Failed - Unexpected status code: {response.status_code}")
                print(f"  Response: {response.text[:200]}...")
                return False, {}
            
            try:
                response_data = response.json()
                print(f"  Response OK")
                self.tests_passed += 1
                print(f"✅ Passed")
                return True, response_data
            except ValueError:
                print(f"❌ Failed - Invalid JSON response: {response.text[:100]}...")
                return False, {}
        
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        
        if success:
            print(f"Status: {response.get('status', 'Not found')}")
            print(f"Timestamp: {response.get('timestamp', 'Not found')}")
        
        return success, response

    def test_create_payment_intent(self, amount=25, email="test@example.com"):
        """Test creating a payment intent for a one-time donation"""
        success, response = self.run_test(
            "Create Payment Intent",
            "POST",
            "create-payment-intent",
            200,
            data={"amount": amount, "email": email, "donationType": "one-time"}
        )
        
        if success:
            print(f"Client Secret: {response.get('clientSecret', 'Not found')[:10]}...")
            print(f"Test Mode: {response.get('isTestMode', 'Not found')}")
            print(f"Test Note: {response.get('testNote', 'Not found')[:30]}..." if 'testNote' in response else "No test note found")
        
        return success, response

    def test_create_donation(self, amount=25, email="test@example.com", session_id="test_session_123", payment_method="card"):
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
                "session_id": session_id,
                "payment_method": payment_method
            }
        )
        
        if success:
            print(f"Donation ID: {response.get('id', 'Not found')}")
            print(f"Payment Method: {response.get('payment_method', payment_method)}")
        
        return success, response

    def test_create_wallet_payment_donation(self, amount=25, email="test@example.com", payment_method="apple_pay"):
        """Test creating a donation record with wallet payment method"""
        session_id = f"wallet_test_{datetime.now().strftime('%H%M%S')}"
        success, response = self.run_test(
            f"Create Donation with {payment_method}",
            "POST",
            "donations",
            200,
            data={
                "type": "one-time",
                "amount": amount,
                "email": email,
                "payment_status": "succeeded",
                "session_id": session_id,
                "payment_method": payment_method
            }
        )
        
        if success:
            print(f"Donation ID: {response.get('id', 'Not found')}")
            print(f"Payment Method: {response.get('payment_method', 'Not found')}")
        
        return success, response

    def test_create_subscription(self, plan="seedling", email="test@example.com"):
        """Test creating a subscription"""
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "create-subscription",
            200,
            data={"plan": plan, "email": email}
        )
        
        if success:
            print(f"Session URL: {response.get('url', 'Not found')[:30]}...")
            print(f"Test Mode: {response.get('test_mode', 'Not found')}")
        
        return success, response

    def test_create_checkout_session(self, amount=25, email="test@example.com"):
        """Test creating a checkout session for one-time donation"""
        success, response = self.run_test(
            "Create Checkout Session",
            "POST",
            "create-checkout-session",
            200,
            data={"amount": amount, "email": email}
        )
        
        if success:
            print(f"Session URL: {response.get('url', 'Not found')[:30]}...")
            print(f"Test Mode: {response.get('test_mode', 'Not found')}")
        
        return success, response

def main():
    tester = MagicForestAPITester()
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
    
    # Run tests
    print(f"Testing Magic Forest API at: {tester.base_url}")
    
    # Test payment intent
    payment_intent_success, payment_intent_data = tester.test_create_payment_intent(
        amount=25,
        email=test_email
    )
    
    # Test creating a donation with card payment
    donation_success, donation_data = tester.test_create_donation(
        amount=25,
        email=test_email,
        session_id=f"test_session_{datetime.now().strftime('%H%M%S')}",
        payment_method="card"
    )
    
    # Test creating a donation with Apple Pay
    apple_pay_success, apple_pay_data = tester.test_create_wallet_payment_donation(
        amount=25,
        email=test_email,
        payment_method="apple_pay"
    )
    
    # Test creating a donation with Google Pay
    google_pay_success, google_pay_data = tester.test_create_wallet_payment_donation(
        amount=25,
        email=test_email,
        payment_method="google_pay"
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
