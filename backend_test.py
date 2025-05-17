
import requests
import sys
import json
import os
from datetime import datetime

class MagicForestAPITester:
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

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_total_donations(self):
        """Test getting total donations"""
        success, response = self.run_test(
            "Total Donations",
            "GET",
            "api/total-donations",
            200
        )
        if success:
            print(f"Total donations: ${response.get('total', 0)}")
        return success

    def test_create_donation(self, donation_type="one-time", amount=25, plan=None):
        """Test creating a donation"""
        data = {
            "type": donation_type,
            "amount": amount,
            "plan": plan
        }
        
        success, response = self.run_test(
            f"Create {donation_type} Donation",
            "POST",
            "api/donations",
            200,
            data=data
        )
        
        if success and 'id' in response:
            self.donation_id = response['id']
            print(f"Created donation with ID: {self.donation_id}")
        
        return success

    def test_get_donation(self):
        """Test getting a donation by ID"""
        if not self.donation_id:
            print("❌ No donation ID available to test")
            return False
            
        success, response = self.run_test(
            "Get Donation by ID",
            "GET",
            f"api/donations/{self.donation_id}",
            200
        )
        
        return success

    def test_get_trees(self):
        """Test getting all trees"""
        success, response = self.run_test(
            "Get All Trees",
            "GET",
            "api/trees",
            200
        )
        
        if success:
            tree_count = len(response)
            print(f"Found {tree_count} trees in the forest")
        
        return success

    def test_create_tree(self, donor_name="Test Donor", message="Test tree message", tree_type="oak"):
        """Test creating a tree"""
        if not self.donation_id:
            print("❌ No donation ID available to create a tree")
            return False
            
        data = {
            "donation_id": self.donation_id,
            "donor": donor_name,
            "message": message,
            "type": tree_type
        }
        
        success, response = self.run_test(
            "Create Tree",
            "POST",
            "api/trees",
            200,
            data=data
        )
        
        if success and 'id' in response:
            self.tree_id = response['id']
            print(f"Created tree with ID: {self.tree_id}")
            print(f"Tree position: x={response.get('x')}, y={response.get('y')}")
        
        return success

    def test_payment_intent(self, amount=25):
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
        
        return success

    def test_create_subscription(self, plan="guardian"):
        """Test creating a subscription"""
        data = {
            "plan": plan
        }
        
        success, response = self.run_test(
            "Create Subscription",
            "POST",
            "api/create-subscription",
            200,
            data=data
        )
        
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
    
    print(f"Testing Magic Forest API at: {backend_url}")
    
    # Setup tester
    tester = MagicForestAPITester(backend_url)
    
    # Run tests
    tests_to_run = [
        tester.test_health_check,
        tester.test_total_donations,
        tester.test_create_donation,
        tester.test_get_donation,
        tester.test_get_trees,
        tester.test_create_tree,
        tester.test_payment_intent,
        tester.test_create_subscription
    ]
    
    for test in tests_to_run:
        test()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return success if all tests passed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
