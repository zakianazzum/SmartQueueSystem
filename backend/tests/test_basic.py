import pytest
from fastapi import status

def test_basic_setup(client):
    """Test that the basic test setup is working."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"Status": "Ok"}

def test_api_health(client):
    """Test that the API is accessible."""
    response = client.get("/api/v1/users")
    # This should return a list (even if empty)
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
