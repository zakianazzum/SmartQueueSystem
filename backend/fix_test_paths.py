#!/usr/bin/env python3
"""
Script to fix API paths in test files.
"""

import re

def fix_test_paths():
    """Fix API paths in test files to include the correct prefix."""
    
    test_file = "tests/test_auth_api.py"
    
    with open(test_file, 'r') as f:
        content = f.read()
    
    # Replace all /users endpoints with /api/v1/users
    content = re.sub(r'client\.post\("/users', 'client.post("/api/v1/users', content)
    content = re.sub(r'client\.get\("/users', 'client.get("/api/v1/users', content)
    content = re.sub(r'client\.put\("/users', 'client.put("/api/v1/users', content)
    content = re.sub(r'client\.delete\("/users', 'client.delete("/api/v1/users', content)
    
    with open(test_file, 'w') as f:
        f.write(content)
    
    print("Fixed API paths in test file")

if __name__ == "__main__":
    fix_test_paths()
