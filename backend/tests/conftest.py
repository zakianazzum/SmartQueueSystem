import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import get_db
from app.models import Base
from main import app

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with a fresh database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "visitor"
    }

@pytest.fixture
def sample_operator_data():
    """Sample operator data for testing."""
    return {
        "name": "Test Operator",
        "email": "operator@test.com",
        "password": "testpassword123",
        "role": "operator"
    }

@pytest.fixture
def sample_admin_data():
    """Sample admin data for testing."""
    return {
        "name": "Test Admin",
        "email": "admin@test.com",
        "password": "testpassword123",
        "role": "administrator"
    }

@pytest.fixture
def sample_login_data():
    """Sample login data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def sample_institution_data():
    """Sample institution data for testing."""
    return {
        "name": "Test Bank",
        "type": "bank",
        "description": "A test bank institution",
        "address": "123 Test Street",
        "city": "Test City",
        "state": "Test State",
        "zipCode": "12345",
        "phone": "+1234567890",
        "email": "contact@testbank.com",
        "website": "https://testbank.com",
        "operatingHours": "9:00 AM - 5:00 PM",
        "capacity": 100,
        "currentOccupancy": 50
    }

@pytest.fixture
def sample_branch_data():
    """Sample branch data for testing."""
    return {
        "name": "Test Branch",
        "address": "456 Branch Street",
        "city": "Branch City",
        "state": "Branch State",
        "zipCode": "54321",
        "phone": "+1987654321",
        "email": "branch@testbank.com",
        "operatingHours": "9:00 AM - 5:00 PM",
        "capacity": 50,
        "currentOccupancy": 25
    }
