#!/usr/bin/env python3
"""
Test script for Institution and Branch APIs
"""

import requests
import json
import uuid

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

def test_institution_type_apis():
    """Test institution type APIs"""
    print("Testing Institution Type APIs...")
    
    # Test data
    institution_type_data = {
        "institutionType": "Test Hospital"
    }
    
    # Create institution type
    print("1. Creating institution type...")
    response = requests.post(f"{BASE_URL}/institution-types", json=institution_type_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        institution_type = response.json()
        print(f"   Created: {institution_type}")
        institution_type_id = institution_type["institutionTypeId"]
        
        # Get all institution types
        print("2. Getting all institution types...")
        response = requests.get(f"{BASE_URL}/institution-types")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Found {len(response.json())} institution types")
        
        # Get institution type by ID
        print("3. Getting institution type by ID...")
        response = requests.get(f"{BASE_URL}/institution-types/{institution_type_id}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Retrieved: {response.json()}")
        
        # Update institution type
        print("4. Updating institution type...")
        update_data = {"institutionType": "Updated Test Hospital"}
        response = requests.put(f"{BASE_URL}/institution-types/{institution_type_id}", json=update_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Updated: {response.json()}")
        
        return institution_type_id
    else:
        print(f"   Error: {response.text}")
        return None

def test_institution_apis(institution_type_id):
    """Test institution APIs"""
    print("\nTesting Institution APIs...")
    
    # Test data
    institution_data = {
        "institutionTypeId": institution_type_id,
        "name": "Test Institution",
        "institutionDescription": "A test institution for API testing"
    }
    
    # Create institution
    print("1. Creating institution...")
    response = requests.post(f"{BASE_URL}/institutions", json=institution_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        institution = response.json()
        print(f"   Created: {institution}")
        institution_id = institution["institutionId"]
        
        # Get all institutions
        print("2. Getting all institutions...")
        response = requests.get(f"{BASE_URL}/institutions")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Found {len(response.json())} institutions")
        
        # Get institution by ID
        print("3. Getting institution by ID...")
        response = requests.get(f"{BASE_URL}/institutions/{institution_id}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Retrieved: {response.json()}")
        
        # Update institution
        print("4. Updating institution...")
        update_data = {"name": "Updated Test Institution"}
        response = requests.put(f"{BASE_URL}/institutions/{institution_id}", json=update_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Updated: {response.json()}")
        
        return institution_id
    else:
        print(f"   Error: {response.text}")
        return None

def test_branch_apis(institution_id):
    """Test branch APIs"""
    print("\nTesting Branch APIs...")
    
    # Test data
    branch_data = {
        "institutionId": institution_id,
        "name": "Test Branch",
        "branchDescription": "A test branch for API testing",
        "address": "123 Test St",
        "serviceHours": "9 AM - 5 PM",
        "serviceDescription": "Test services",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "capacity": 100
    }
    
    # Create branch
    print("1. Creating branch...")
    response = requests.post(f"{BASE_URL}/branches", json=branch_data)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        branch = response.json()
        print(f"   Created: {branch}")
        branch_id = branch["branchId"]
        
        # Get all branches
        print("2. Getting all branches...")
        response = requests.get(f"{BASE_URL}/branches")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Found {len(response.json())} branches")
        
        # Get branch by ID
        print("3. Getting branch by ID...")
        response = requests.get(f"{BASE_URL}/branches/{branch_id}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Retrieved: {response.json()}")
        
        # Get branches by institution ID
        print("4. Getting branches by institution ID...")
        response = requests.get(f"{BASE_URL}/institutions/{institution_id}/branches")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            branches = response.json()
            print(f"   Found {len(branches)} branches for institution")
        
        # Update branch
        print("5. Updating branch...")
        update_data = {"name": "Updated Test Branch", "capacity": 150}
        response = requests.put(f"{BASE_URL}/branches/{branch_id}", json=update_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Updated: {response.json()}")
        
        return branch_id
    else:
        print(f"   Error: {response.text}")
        return None

def test_legacy_endpoint():
    """Test legacy endpoint"""
    print("\nTesting Legacy Endpoint...")
    
    response = requests.get(f"{BASE_URL}/institutions/all")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Legacy endpoint working: {len(response.json())} institutions found")
    else:
        print(f"   Error: {response.text}")

def main():
    """Main test function"""
    print("Starting Institution and Branch API Tests...")
    print("=" * 50)
    
    try:
        # Test institution type APIs
        institution_type_id = test_institution_type_apis()
        
        if institution_type_id:
            # Test institution APIs
            institution_id = test_institution_apis(institution_type_id)
            
            if institution_id:
                # Test branch APIs
                branch_id = test_branch_apis(institution_id)
                
                if branch_id:
                    # Test legacy endpoint
                    test_legacy_endpoint()
                    
                    print("\n" + "=" * 50)
                    print("All tests completed successfully!")
                    print("=" * 50)
                else:
                    print("Branch API tests failed")
            else:
                print("Institution API tests failed")
        else:
            print("Institution Type API tests failed")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    main()
