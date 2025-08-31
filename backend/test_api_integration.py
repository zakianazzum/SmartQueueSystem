#!/usr/bin/env python3
"""
Test script to verify API integration and add sample data
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_api_endpoints():
    """Test all the main API endpoints"""
    
    print("🧪 Testing Smart Queue System API Integration")
    print("=" * 50)
    
    # Test 1: Get all institution types
    print("\n1. Testing GET /institution-types")
    try:
        response = requests.get(f"{BASE_URL}/institution-types")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            institution_types = response.json()
            print(f"   Found {len(institution_types)} institution types")
            for it in institution_types:
                print(f"   - {it['institutionType']} (ID: {it['institutionTypeId']})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Get all institutions
    print("\n2. Testing GET /institutions")
    try:
        response = requests.get(f"{BASE_URL}/institutions")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            institutions = response.json()
            print(f"   Found {len(institutions)} institutions")
            for inst in institutions:
                print(f"   - {inst['name']} (ID: {inst['institutionId']})")
                print(f"     Branches: {len(inst.get('branches', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Get all branches
    print("\n3. Testing GET /branches")
    try:
        response = requests.get(f"{BASE_URL}/branches")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            branches = response.json()
            print(f"   Found {len(branches)} branches")
            for branch in branches:
                print(f"   - {branch['name']} (ID: {branch['branchId']})")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Get all users
    print("\n4. Testing GET /users")
    try:
        response = requests.get(f"{BASE_URL}/users")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"   Found {len(users)} users")
            for user in users:
                print(f"   - {user['name']} ({user['email']}) - {user['role']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")

def create_sample_data():
    """Create sample data for testing"""
    
    print("\n\n📝 Creating Sample Data")
    print("=" * 50)
    
    # Create institution types
    institution_types = [
        {"institutionType": "Bank"},
        {"institutionType": "Government Office"},
        {"institutionType": "Park"},
        {"institutionType": "Hospital"},
        {"institutionType": "Shopping Mall"}
    ]
    
    print("\n1. Creating institution types...")
    created_types = []
    for it_data in institution_types:
        try:
            response = requests.post(f"{BASE_URL}/institution-types", json=it_data)
            if response.status_code == 200:
                created_type = response.json()
                created_types.append(created_type)
                print(f"   ✅ Created: {created_type['institutionType']}")
            else:
                print(f"   ❌ Failed to create {it_data['institutionType']}: {response.text}")
        except Exception as e:
            print(f"   ❌ Error creating {it_data['institutionType']}: {e}")
    
    # Create users
    users_data = [
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "visitor",
            "password": "password123"
        },
        {
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "role": "administrator",
            "password": "password123"
        },
        {
            "name": "Bob Johnson",
            "email": "bob.johnson@example.com",
            "role": "operator",
            "password": "password123"
        }
    ]
    
    print("\n2. Creating users...")
    created_users = []
    for user_data in users_data:
        try:
            response = requests.post(f"{BASE_URL}/users", json=user_data)
            if response.status_code == 200:
                created_user = response.json()
                created_users.append(created_user)
                print(f"   ✅ Created: {created_user['name']} ({created_user['role']})")
            else:
                print(f"   ❌ Failed to create {user_data['name']}: {response.text}")
        except Exception as e:
            print(f"   ❌ Error creating {user_data['name']}: {e}")
    
    # Create institutions
    institutions_data = [
        {
            "name": "Central Bank Downtown",
            "institutionTypeId": created_types[0]['institutionTypeId'] if created_types else None,
            "administratorId": created_users[1]['userId'] if len(created_users) > 1 else None,
            "institutionDescription": "Main banking branch serving downtown area"
        },
        {
            "name": "City Hall Government Center",
            "institutionTypeId": created_types[1]['institutionTypeId'] if created_types else None,
            "administratorId": created_users[1]['userId'] if len(created_users) > 1 else None,
            "institutionDescription": "Central government services office"
        },
        {
            "name": "Central Park Recreation",
            "institutionTypeId": created_types[2]['institutionTypeId'] if created_types else None,
            "institutionDescription": "Main city park with recreational facilities"
        }
    ]
    
    print("\n3. Creating institutions...")
    created_institutions = []
    for inst_data in institutions_data:
        try:
            response = requests.post(f"{BASE_URL}/institutions", json=inst_data)
            if response.status_code == 200:
                created_institution = response.json()
                created_institutions.append(created_institution)
                print(f"   ✅ Created: {created_institution['name']}")
            else:
                print(f"   ❌ Failed to create {inst_data['name']}: {response.text}")
        except Exception as e:
            print(f"   ❌ Error creating {inst_data['name']}: {e}")
    
    # Create branches
    branches_data = [
        {
            "institutionId": created_institutions[0]['institutionId'] if created_institutions else None,
            "name": "Main Branch",
            "branchDescription": "Primary banking services",
            "address": "123 Main Street, Downtown",
            "serviceHours": "9:00 AM - 5:00 PM",
            "serviceDescription": "Full banking services including loans and investments",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "capacity": 100
        },
        {
            "institutionId": created_institutions[0]['institutionId'] if created_institutions else None,
            "name": "ATM Center",
            "branchDescription": "24/7 ATM services",
            "address": "456 Oak Avenue, Downtown",
            "serviceHours": "24/7",
            "serviceDescription": "ATM and basic banking services",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "capacity": 20
        },
        {
            "institutionId": created_institutions[1]['institutionId'] if len(created_institutions) > 1 else None,
            "name": "Passport Office",
            "branchDescription": "Passport and document services",
            "address": "789 Government Boulevard",
            "serviceHours": "8:00 AM - 4:00 PM",
            "serviceDescription": "Passport applications and renewals",
            "latitude": 40.7831,
            "longitude": -73.9712,
            "capacity": 50
        },
        {
            "institutionId": created_institutions[2]['institutionId'] if len(created_institutions) > 2 else None,
            "name": "Recreation Center",
            "branchDescription": "Sports and recreation facilities",
            "address": "321 Park Lane",
            "serviceHours": "6:00 AM - 10:00 PM",
            "serviceDescription": "Sports courts, swimming pool, and fitness center",
            "latitude": 40.7505,
            "longitude": -74.0134,
            "capacity": 200
        }
    ]
    
    print("\n4. Creating branches...")
    created_branches = []
    for branch_data in branches_data:
        if branch_data['institutionId']:  # Only create if we have a valid institution ID
            try:
                response = requests.post(f"{BASE_URL}/branches", json=branch_data)
                if response.status_code == 200:
                    created_branch = response.json()
                    created_branches.append(created_branch)
                    print(f"   ✅ Created: {created_branch['name']}")
                else:
                    print(f"   ❌ Failed to create {branch_data['name']}: {response.text}")
            except Exception as e:
                print(f"   ❌ Error creating {branch_data['name']}: {e}")
        else:
            print(f"   ⚠️  Skipped {branch_data['name']} (no institution ID)")
    
    print(f"\n✅ Sample data creation completed!")
    print(f"   - {len(created_types)} institution types")
    print(f"   - {len(created_users)} users")
    print(f"   - {len(created_institutions)} institutions")
    print(f"   - {len(created_branches)} branches")

if __name__ == "__main__":
    # First test the endpoints
    test_api_endpoints()
    
    # Then create sample data
    create_sample_data()
    
    # Test again to see the new data
    print("\n\n🔄 Testing API endpoints after sample data creation...")
    test_api_endpoints()
