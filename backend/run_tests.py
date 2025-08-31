#!/usr/bin/env python3
"""
Test runner script for the SmartQueue backend.
"""

import sys
import subprocess
import os
from pathlib import Path

def run_tests():
    """Run the test suite with proper configuration."""
    
    # Get the directory containing this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Test command with coverage
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        "-v",
        "--tb=short",
        "--cov=app",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "--cov-fail-under=80"
    ]
    
    # Add markers if specified
    if len(sys.argv) > 1:
        marker = sys.argv[1]
        if marker in ["auth", "api", "unit", "integration"]:
            cmd.extend(["-m", marker])
    
    print(f"Running tests with command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True)
        print("\n✅ All tests passed!")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return e.returncode

def run_specific_test(test_file):
    """Run a specific test file."""
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    cmd = [
        sys.executable, "-m", "pytest",
        f"tests/{test_file}",
        "-v",
        "--tb=short"
    ]
    
    print(f"Running specific test: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True)
        print("\n✅ Test passed!")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Test failed with exit code {e.returncode}")
        return e.returncode

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].endswith(".py"):
        # Run specific test file
        exit_code = run_specific_test(sys.argv[1])
    else:
        # Run all tests
        exit_code = run_tests()
    
    sys.exit(exit_code)
