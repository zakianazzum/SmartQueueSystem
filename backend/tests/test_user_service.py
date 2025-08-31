import pytest
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.services.user_service import user_service
from app.schemas.user_schema import UserCreate, UserUpdate, LoginRequest
from app.models import User, Visitor
from app.db.crud import get_user_by_email

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TestUserService:
    """Test cases for user service layer."""

    @pytest.mark.unit
    def test_create_user_success(self, db_session: Session, sample_user_data):
        """Test successful user creation."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        assert created_user is not None
        assert created_user.email == sample_user_data["email"]
        assert created_user.name == sample_user_data["name"]
        assert created_user.role == sample_user_data["role"]
        assert created_user.userId is not None
        assert created_user.createdAt is not None
        assert created_user.updatedAt is not None
        
        # Verify password is hashed
        db_user = get_user_by_email(db=db_session, email=sample_user_data["email"])
        assert db_user is not None
        assert pwd_context.verify(sample_user_data["password"], db_user.password)

    @pytest.mark.unit
    def test_create_user_duplicate_email(self, db_session: Session, sample_user_data):
        """Test user creation with duplicate email."""
        user_create = UserCreate(**sample_user_data)
        
        # Create first user
        user_service.create_user(db=db_session, user_data=user_create)
        
        # Try to create second user with same email
        with pytest.raises(Exception):
            user_service.create_user(db=db_session, user_data=user_create)

    @pytest.mark.unit
    def test_create_visitor_user(self, db_session: Session, sample_user_data):
        """Test creating a visitor user with visitor record."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Check that visitor record was created
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is not None
        assert visitor.userId == created_user.userId

    @pytest.mark.unit
    def test_create_operator_user(self, db_session: Session, sample_operator_data):
        """Test creating an operator user."""
        user_create = UserCreate(**sample_operator_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        assert created_user.role == "operator"
        
        # Check that no visitor record was created for operator
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is None

    @pytest.mark.unit
    def test_create_admin_user(self, db_session: Session, sample_admin_data):
        """Test creating an administrator user."""
        user_create = UserCreate(**sample_admin_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        assert created_user.role == "administrator"
        
        # Check that no visitor record was created for admin
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is None

    @pytest.mark.unit
    def test_login_user_success_visitor(self, db_session: Session, sample_user_data):
        """Test successful login for visitor user."""
        # Create user first
        user_create = UserCreate(**sample_user_data)
        user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login
        login_request = LoginRequest(
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result is not None
        assert login_result.user.email == sample_user_data["email"]
        assert login_result.user.name == sample_user_data["name"]
        assert login_result.user.role == "visitor"
        assert login_result.visitorId is not None

    @pytest.mark.unit
    def test_login_user_success_operator(self, db_session: Session, sample_operator_data):
        """Test successful login for operator user."""
        # Create user first
        user_create = UserCreate(**sample_operator_data)
        user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login
        login_request = LoginRequest(
            email=sample_operator_data["email"],
            password=sample_operator_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result is not None
        assert login_result.user.email == sample_operator_data["email"]
        assert login_result.user.name == sample_operator_data["name"]
        assert login_result.user.role == "operator"
        assert login_result.visitorId is None

    @pytest.mark.unit
    def test_login_user_invalid_credentials(self, db_session: Session, sample_user_data):
        """Test login with invalid credentials."""
        # Create user first
        user_create = UserCreate(**sample_user_data)
        user_service.create_user(db=db_session, user_data=user_create)
        
        # Test login with wrong password
        login_request = LoginRequest(
            email=sample_user_data["email"],
            password="wrongpassword"
        )
        
        with pytest.raises(Exception) as exc_info:
            user_service.login_user(db=db_session, login_data=login_request)
        
        assert "Invalid credentials" in str(exc_info.value)

    @pytest.mark.unit
    def test_login_user_not_found(self, db_session: Session):
        """Test login with non-existent user."""
        login_request = LoginRequest(
            email="nonexistent@example.com",
            password="password123"
        )
        
        with pytest.raises(Exception) as exc_info:
            user_service.login_user(db=db_session, login_data=login_request)
        
        assert "Invalid credentials" in str(exc_info.value)

    @pytest.mark.unit
    def test_get_user_by_id_success(self, db_session: Session, sample_user_data):
        """Test successful user retrieval by ID."""
        # Create user first
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Get user by ID
        retrieved_user = user_service.get_user_by_id(db=db_session, user_id=created_user.userId)
        
        assert retrieved_user is not None
        assert retrieved_user.userId == created_user.userId
        assert retrieved_user.email == sample_user_data["email"]
        assert retrieved_user.name == sample_user_data["name"]
        assert retrieved_user.role == sample_user_data["role"]

    @pytest.mark.unit
    def test_get_user_by_id_not_found(self, db_session: Session):
        """Test user retrieval with non-existent ID."""
        retrieved_user = user_service.get_user_by_id(db=db_session, user_id="nonexistent-id")
        
        assert retrieved_user is None

    @pytest.mark.unit
    def test_get_all_users(self, db_session: Session, sample_user_data, sample_operator_data):
        """Test retrieval of all users."""
        # Create multiple users
        user_service.create_user(db=db_session, user_data=UserCreate(**sample_user_data))
        user_service.create_user(db=db_session, user_data=UserCreate(**sample_operator_data))
        
        users = user_service.get_all_users(db=db_session)
        
        assert len(users) >= 2
        
        # Check that all users have required fields
        for user in users:
            assert user.userId is not None
            assert user.email is not None
            assert user.name is not None
            assert user.role is not None
            assert user.createdAt is not None
            assert user.updatedAt is not None

    @pytest.mark.unit
    def test_update_user_success(self, db_session: Session, sample_user_data):
        """Test successful user update."""
        # Create user first
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Update user
        update_data = UserUpdate(
            name="Updated Name",
            email="updated@example.com"
        )
        
        updated_user = user_service.update_user(
            db=db_session,
            user_id=created_user.userId,
            user_data=update_data
        )
        
        assert updated_user is not None
        assert updated_user.name == "Updated Name"
        assert updated_user.email == "updated@example.com"
        assert updated_user.role == sample_user_data["role"]  # Role should remain unchanged

    @pytest.mark.unit
    def test_update_user_not_found(self, db_session: Session):
        """Test user update with non-existent ID."""
        update_data = UserUpdate(name="Updated Name")
        
        updated_user = user_service.update_user(
            db=db_session,
            user_id="nonexistent-id",
            user_data=update_data
        )
        
        assert updated_user is None

    @pytest.mark.unit
    def test_delete_user_success(self, db_session: Session, sample_user_data):
        """Test successful user deletion."""
        # Create user first
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Delete user
        success = user_service.delete_user(db=db_session, user_id=created_user.userId)
        
        assert success is True
        
        # Verify user is deleted
        retrieved_user = user_service.get_user_by_id(db=db_session, user_id=created_user.userId)
        assert retrieved_user is None

    @pytest.mark.unit
    def test_delete_user_not_found(self, db_session: Session):
        """Test user deletion with non-existent ID."""
        success = user_service.delete_user(db=db_session, user_id="nonexistent-id")
        
        assert success is False

    @pytest.mark.unit
    def test_password_hashing(self, db_session: Session, sample_user_data):
        """Test that passwords are properly hashed."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Get the user from database
        db_user = get_user_by_email(db=db_session, email=sample_user_data["email"])
        
        # Verify password is hashed and can be verified
        assert pwd_context.verify(sample_user_data["password"], db_user.password)
        assert not pwd_context.verify("wrongpassword", db_user.password)

    @pytest.mark.unit
    def test_case_insensitive_email(self, db_session: Session, sample_user_data):
        """Test that email operations are case insensitive."""
        # Create user with lowercase email
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Try to login with uppercase email
        login_request = LoginRequest(
            email=sample_user_data["email"].upper(),
            password=sample_user_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result is not None
        assert login_result.user.email == sample_user_data["email"]

    @pytest.mark.unit
    def test_visitor_id_generation(self, db_session: Session, sample_user_data):
        """Test that visitor ID is generated for visitor users."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Login to get visitor ID
        login_request = LoginRequest(
            email=sample_user_data["email"],
            password=sample_user_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result.visitorId is not None
        assert isinstance(login_result.visitorId, str)
        assert len(login_result.visitorId) > 0

    @pytest.mark.unit
    def test_operator_no_visitor_id(self, db_session: Session, sample_operator_data):
        """Test that operators don't get visitor IDs."""
        user_create = UserCreate(**sample_operator_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Login to check no visitor ID
        login_request = LoginRequest(
            email=sample_operator_data["email"],
            password=sample_operator_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result.visitorId is None

    @pytest.mark.unit
    def test_admin_no_visitor_id(self, db_session: Session, sample_admin_data):
        """Test that administrators don't get visitor IDs."""
        user_create = UserCreate(**sample_admin_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Login to check no visitor ID
        login_request = LoginRequest(
            email=sample_admin_data["email"],
            password=sample_admin_data["password"]
        )
        
        login_result = user_service.login_user(db=db_session, login_data=login_request)
        
        assert login_result.visitorId is None

    @pytest.mark.unit
    def test_user_timestamps(self, db_session: Session, sample_user_data):
        """Test that user timestamps are properly set."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        assert created_user.createdAt is not None
        assert created_user.updatedAt is not None
        
        # Verify timestamps are valid
        from datetime import datetime
        created_at = datetime.fromisoformat(created_user.createdAt.replace('Z', '+00:00'))
        updated_at = datetime.fromisoformat(created_user.updatedAt.replace('Z', '+00:00'))
        
        assert created_at <= updated_at

    @pytest.mark.unit
    def test_update_user_timestamps(self, db_session: Session, sample_user_data):
        """Test that user timestamps are updated on modification."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        original_updated_at = created_user.updatedAt
        
        # Update user
        update_data = UserUpdate(name="Updated Name")
        updated_user = user_service.update_user(
            db=db_session,
            user_id=created_user.userId,
            user_data=update_data
        )
        
        # Verify updated timestamp is newer
        from datetime import datetime
        original_time = datetime.fromisoformat(original_updated_at.replace('Z', '+00:00'))
        updated_time = datetime.fromisoformat(updated_user.updatedAt.replace('Z', '+00:00'))
        
        assert updated_time > original_time

    @pytest.mark.unit
    def test_user_role_validation(self, db_session: Session, sample_user_data):
        """Test user role validation."""
        # Test with invalid role
        invalid_data = sample_user_data.copy()
        invalid_data["role"] = "invalid_role"
        
        with pytest.raises(Exception):
            user_create = UserCreate(**invalid_data)
            user_service.create_user(db=db_session, user_data=user_create)

    @pytest.mark.unit
    def test_email_validation(self, db_session: Session, sample_user_data):
        """Test email validation."""
        # Test with invalid email
        invalid_data = sample_user_data.copy()
        invalid_data["email"] = "invalid-email"
        
        with pytest.raises(Exception):
            user_create = UserCreate(**invalid_data)
            user_service.create_user(db=db_session, user_data=user_create)

    @pytest.mark.unit
    def test_password_validation(self, db_session: Session, sample_user_data):
        """Test password validation."""
        # Test with empty password
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = ""
        
        with pytest.raises(Exception):
            user_create = UserCreate(**invalid_data)
            user_service.create_user(db=db_session, user_data=user_create)

    @pytest.mark.unit
    def test_user_data_integrity(self, db_session: Session, sample_user_data):
        """Test that user data integrity is maintained."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Verify all fields are present and correct
        assert created_user.name == sample_user_data["name"]
        assert created_user.email == sample_user_data["email"]
        assert created_user.role == sample_user_data["role"]
        assert created_user.userId is not None
        assert created_user.createdAt is not None
        assert created_user.updatedAt is not None
        
        # Verify no password is returned
        assert not hasattr(created_user, 'password')

    @pytest.mark.unit
    def test_visitor_record_creation(self, db_session: Session, sample_user_data):
        """Test that visitor record is created for visitor users."""
        user_create = UserCreate(**sample_user_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Check visitor record in database
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is not None
        assert visitor.userId == created_user.userId

    @pytest.mark.unit
    def test_visitor_record_not_created_for_operator(self, db_session: Session, sample_operator_data):
        """Test that visitor record is not created for operator users."""
        user_create = UserCreate(**sample_operator_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Check no visitor record in database
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is None

    @pytest.mark.unit
    def test_visitor_record_not_created_for_admin(self, db_session: Session, sample_admin_data):
        """Test that visitor record is not created for admin users."""
        user_create = UserCreate(**sample_admin_data)
        created_user = user_service.create_user(db=db_session, user_data=user_create)
        
        # Check no visitor record in database
        visitor = db_session.query(Visitor).filter(Visitor.userId == created_user.userId).first()
        assert visitor is None
