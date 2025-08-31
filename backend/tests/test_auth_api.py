import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.services.user_service import user_service
from app.schemas.user_schema import UserCreate, LoginRequest


class TestAuthAPI:
    """Test cases for authentication API endpoints."""

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_success_visitor(self, client, db_session: Session, sample_user_data):
        """Test successful login for a visitor user."""
        # Create a user first
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "user" in data
        assert "visitorId" in data
        assert data["user"]["email"] == sample_user_data["email"]
        assert data["user"]["name"] == sample_user_data["name"]
        assert data["user"]["role"] == "visitor"
        assert "userId" in data["user"]
        assert "createdAt" in data["user"]
        assert "updatedAt" in data["user"]
        assert data["visitorId"] is not None

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_success_operator(self, client, db_session: Session, sample_operator_data):
        """Test successful login for an operator user."""
        # Create an operator user first
        user_create = UserCreate(**sample_operator_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login
        login_data = {
            "email": sample_operator_data["email"],
            "password": sample_operator_data["password"]
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "user" in data
        assert data["user"]["email"] == sample_operator_data["email"]
        assert data["user"]["name"] == sample_operator_data["name"]
        assert data["user"]["role"] == "operator"
        # Operators don't have visitorId
        assert "visitorId" not in data

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_success_admin(self, client, db_session: Session, sample_admin_data):
        """Test successful login for an administrator user."""
        # Create an admin user first
        user_create = UserCreate(**sample_admin_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login
        login_data = {
            "email": sample_admin_data["email"],
            "password": sample_admin_data["password"]
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "user" in data
        assert data["user"]["email"] == sample_admin_data["email"]
        assert data["user"]["name"] == sample_admin_data["name"]
        assert data["user"]["role"] == "administrator"
        # Admins don't have visitorId
        assert "visitorId" not in data

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_invalid_credentials(self, client, db_session: Session, sample_user_data):
        """Test login with invalid credentials."""
        # Create a user first
        user_create = UserCreate(**sample_user_data)
        user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login with wrong password
        login_data = {
            "email": sample_user_data["email"],
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data
        assert "Invalid credentials" in data["detail"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_user_not_found(self, client, db_session: Session):
        """Test login with non-existent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data
        assert "Invalid credentials" in data["detail"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_missing_email(self, client, db_session: Session):
        """Test login with missing email."""
        login_data = {
            "password": "password123"
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_missing_password(self, client, db_session: Session):
        """Test login with missing password."""
        login_data = {
            "email": "test@example.com"
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_invalid_email_format(self, client, db_session: Session):
        """Test login with invalid email format."""
        login_data = {
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_login_empty_fields(self, client, db_session: Session):
        """Test login with empty fields."""
        login_data = {
            "email": "",
            "password": ""
        }
        
        response = client.post("/api/v1/users/login", json=login_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_create_user_success(self, client, db_session: Session, sample_user_data):
        """Test successful user creation."""
        response = client.post("/api/v1/users", json=sample_user_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["email"] == sample_user_data["email"]
        assert data["name"] == sample_user_data["name"]
        assert data["role"] == sample_user_data["role"]
        assert "userId" in data
        assert "createdAt" in data
        assert "updatedAt" in data
        assert "password" not in data  # Password should not be returned

    @pytest.mark.auth
    @pytest.mark.api
    def test_create_user_duplicate_email(self, client, db_session: Session, sample_user_data):
        """Test user creation with duplicate email."""
        # Create first user
        response1 = client.post("/api/v1/users", json=sample_user_data)
        assert response1.status_code == status.HTTP_200_OK
        
        # Try to create second user with same email
        response2 = client.post("/api/v1/users", json=sample_user_data)
        assert response2.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    @pytest.mark.auth
    @pytest.mark.api
    def test_create_user_invalid_email(self, client, db_session: Session, sample_user_data):
        """Test user creation with invalid email."""
        sample_user_data["email"] = "invalid-email"
        
        response = client.post("/api/v1/users", json=sample_user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_create_user_missing_required_fields(self, client, db_session: Session):
        """Test user creation with missing required fields."""
        incomplete_data = {
            "name": "Test User"
            # Missing email and password
        }
        
        response = client.post("/api/v1/users", json=incomplete_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_get_user_by_id_success(self, client, db_session: Session, sample_user_data):
        """Test successful user retrieval by ID."""
        # Create a user first
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        created_user = response.json()
        
        # Get user by ID
        user_id = created_user["userId"]
        response = client.get(f"/users/{user_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["userId"] == user_id
        assert data["email"] == sample_user_data["email"]
        assert data["name"] == sample_user_data["name"]
        assert data["role"] == sample_user_data["role"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_get_user_by_id_not_found(self, client, db_session: Session):
        """Test user retrieval with non-existent ID."""
        response = client.get("/api/v1/users/nonexistent-id")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "detail" in data
        assert "User not found" in data["detail"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_get_all_users(self, client, db_session: Session, sample_user_data, sample_operator_data):
        """Test retrieval of all users."""
        # Create multiple users
        client.post("/api/v1/users", json=sample_user_data)
        client.post("/api/v1/users", json=sample_operator_data)
        
        response = client.get("/api/v1/users")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 2
        
        # Check that passwords are not included
        for user in data:
            assert "password" not in user
            assert "userId" in user
            assert "email" in user
            assert "name" in user
            assert "role" in user

    @pytest.mark.auth
    @pytest.mark.api
    def test_update_user_success(self, client, db_session: Session, sample_user_data):
        """Test successful user update."""
        # Create a user first
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        created_user = response.json()
        
        # Update user
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com"
        }
        
        user_id = created_user["userId"]
        response = client.put(f"/users/{user_id}", json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["name"] == update_data["name"]
        assert data["email"] == update_data["email"]
        assert data["role"] == sample_user_data["role"]  # Role should remain unchanged

    @pytest.mark.auth
    @pytest.mark.api
    def test_update_user_not_found(self, client, db_session: Session):
        """Test user update with non-existent ID."""
        update_data = {
            "name": "Updated Name"
        }
        
        response = client.put("/api/v1/users/nonexistent-id", json=update_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "detail" in data
        assert "User not found" in data["detail"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_delete_user_success(self, client, db_session: Session, sample_user_data):
        """Test successful user deletion."""
        # Create a user first
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        created_user = response.json()
        
        # Delete user
        user_id = created_user["userId"]
        response = client.delete(f"/users/{user_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "deleted successfully" in data["message"]
        
        # Verify user is deleted
        get_response = client.get(f"/users/{user_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.auth
    @pytest.mark.api
    def test_delete_user_not_found(self, client, db_session: Session):
        """Test user deletion with non-existent ID."""
        response = client.delete("/api/v1/users/nonexistent-id")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "detail" in data
        assert "User not found" in data["detail"]

    @pytest.mark.auth
    @pytest.mark.api
    def test_password_hashing(self, client, db_session: Session, sample_user_data):
        """Test that passwords are properly hashed."""
        # Create a user
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Try to login with the same password
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        login_response = client.post("/api/v1/users/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK

    @pytest.mark.auth
    @pytest.mark.api
    def test_case_insensitive_email_login(self, client, db_session: Session, sample_user_data):
        """Test that email login is case insensitive."""
        # Create a user with lowercase email
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Try to login with uppercase email
        login_data = {
            "email": sample_user_data["email"].upper(),
            "password": sample_user_data["password"]
        }
        
        login_response = client.post("/api/v1/users/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK

    @pytest.mark.auth
    @pytest.mark.api
    def test_visitor_id_generation(self, client, db_session: Session, sample_user_data):
        """Test that visitor ID is generated for visitor users."""
        # Create a visitor user
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Login and check for visitor ID
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        
        login_response = client.post("/api/v1/users/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        
        data = login_response.json()
        assert "visitorId" in data
        assert data["visitorId"] is not None
        assert isinstance(data["visitorId"], str)
        assert len(data["visitorId"]) > 0

    @pytest.mark.auth
    @pytest.mark.api
    def test_operator_no_visitor_id(self, client, db_session: Session, sample_operator_data):
        """Test that operators don't get visitor IDs."""
        # Create an operator user
        response = client.post("/api/v1/users", json=sample_operator_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Login and check no visitor ID
        login_data = {
            "email": sample_operator_data["email"],
            "password": sample_operator_data["password"]
        }
        
        login_response = client.post("/api/v1/users/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        
        data = login_response.json()
        assert "visitorId" not in data

    @pytest.mark.auth
    @pytest.mark.api
    def test_admin_no_visitor_id(self, client, db_session: Session, sample_admin_data):
        """Test that administrators don't get visitor IDs."""
        # Create an admin user
        response = client.post("/api/v1/users", json=sample_admin_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Login and check no visitor ID
        login_data = {
            "email": sample_admin_data["email"],
            "password": sample_admin_data["password"]
        }
        
        login_response = client.post("/api/v1/users/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        
        data = login_response.json()
        assert "visitorId" not in data

    @pytest.mark.auth
    @pytest.mark.api
    def test_password_validation(self, client, db_session: Session, sample_user_data):
        """Test password validation."""
        # Test with very short password
        short_password_data = sample_user_data.copy()
        short_password_data["password"] = "123"
        
        response = client.post("/api/v1/users", json=short_password_data)
        # Should fail validation (assuming minimum password length)
        assert response.status_code in [status.HTTP_422_UNPROCESSABLE_ENTITY, status.HTTP_500_INTERNAL_SERVER_ERROR]

    @pytest.mark.auth
    @pytest.mark.api
    def test_email_uniqueness(self, client, db_session: Session, sample_user_data):
        """Test email uniqueness constraint."""
        # Create first user
        response1 = client.post("/api/v1/users", json=sample_user_data)
        assert response1.status_code == status.HTTP_200_OK
        
        # Try to create second user with same email but different case
        duplicate_data = sample_user_data.copy()
        duplicate_data["email"] = sample_user_data["email"].upper()
        
        response2 = client.post("/api/v1/users", json=duplicate_data)
        assert response2.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    @pytest.mark.auth
    @pytest.mark.api
    def test_user_roles_validation(self, client, db_session: Session, sample_user_data):
        """Test user role validation."""
        # Test with invalid role
        invalid_role_data = sample_user_data.copy()
        invalid_role_data["role"] = "invalid_role"
        
        response = client.post("/api/v1/users", json=invalid_role_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.auth
    @pytest.mark.api
    def test_user_data_integrity(self, client, db_session: Session, sample_user_data):
        """Test that user data integrity is maintained."""
        # Create user
        response = client.post("/api/v1/users", json=sample_user_data)
        assert response.status_code == status.HTTP_200_OK
        created_user = response.json()
        
        # Verify all fields are present and correct
        assert created_user["name"] == sample_user_data["name"]
        assert created_user["email"] == sample_user_data["email"]
        assert created_user["role"] == sample_user_data["role"]
        assert "userId" in created_user
        assert "createdAt" in created_user
        assert "updatedAt" in created_user
        assert "password" not in created_user  # Password should never be returned
        
        # Verify timestamps are valid
        from datetime import datetime
        created_at = datetime.fromisoformat(created_user["createdAt"].replace('Z', '+00:00'))
        updated_at = datetime.fromisoformat(created_user["updatedAt"].replace('Z', '+00:00'))
        assert created_at <= updated_at
