import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.models import Branch, Institution, InstitutionType, User
from app.schemas.branch_schema import BranchCreate, BranchUpdate


class TestBranchesAPI:
    """Test cases for branches API endpoints."""

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_all_branches_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of all branches."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Create test branches
        branch1 = Branch(
            name="Main Branch",
            branch_description="Main building",
            address="123 Main St",
            service_hours="24/7",
            service_description="Emergency and general care",
            latitude=40.7128,
            longitude=-74.0060,
            capacity=100,
            institution_id=institution.institution_id
        )
        branch2 = Branch(
            name="Emergency Branch",
            branch_description="Emergency services",
            address="456 Emergency St",
            service_hours="24/7",
            service_description="Emergency care only",
            latitude=40.7589,
            longitude=-73.9851,
            capacity=50,
            institution_id=institution.institution_id
        )
        
        db_session.add_all([branch1, branch2])
        db_session.commit()

        response = client.get("/api/v1/branches")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Main Branch"
        assert data[1]["name"] == "Emergency Branch"

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_all_branches_empty(self, client):
        """Test retrieval of branches when none exist."""
        response = client.get("/api/v1/branches")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_branch_by_id_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of branch by ID."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch = Branch(
            name="Test Branch",
            branch_description="A test branch",
            address="123 Test St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        response = client.get(f"/api/v1/branches/{branch.branch_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Branch"
        assert data["branch_description"] == "A test branch"

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_branch_by_id_not_found(self, client):
        """Test retrieval of non-existent branch."""
        response = client.get("/api/v1/branches/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_create_branch_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful branch creation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch_data = {
            "name": "New Branch",
            "branch_description": "A new branch",
            "address": "789 New St",
            "service_hours": "9 AM - 5 PM",
            "service_description": "General services",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "capacity": 75,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Branch"
        assert data["branch_description"] == "A new branch"
        assert "branch_id" in data

    @pytest.mark.api
    @pytest.mark.branches
    def test_create_branch_missing_required_fields(self, client):
        """Test branch creation with missing required fields."""
        # Missing name
        branch_data = {
            "branch_description": "A branch without name"
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_create_branch_invalid_institution_id(self, client):
        """Test branch creation with invalid institution ID."""
        branch_data = {
            "name": "New Branch",
            "branch_description": "A new branch",
            "address": "789 New St",
            "capacity": 75,
            "institution_id": 999  # Non-existent institution
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "institution" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_create_branch_duplicate_name_same_institution(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with duplicate name in same institution."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Create first branch
        branch1 = Branch(
            name="Duplicate Branch",
            branch_description="First branch",
            address="123 First St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch1)
        db_session.commit()

        # Try to create second branch with same name in same institution
        branch_data = {
            "name": "Duplicate Branch",
            "branch_description": "Second branch",
            "address": "456 Second St",
            "capacity": 50,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "already exists" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_create_branch_same_name_different_institution(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with same name in different institutions (should succeed)."""
        # Create two test institutions
        institution1 = Institution(
            name="Institution 1",
            institution_description="First institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        institution2 = Institution(
            name="Institution 2",
            institution_description="Second institution",
            institution_type_id=sample_institution_types[1].institution_type_id,
            administrator_id=sample_administrators[1].user_id
        )
        db_session.add_all([institution1, institution2])
        db_session.commit()

        # Create first branch
        branch1 = Branch(
            name="Same Name Branch",
            branch_description="First branch",
            address="123 First St",
            capacity=100,
            institution_id=institution1.institution_id
        )
        db_session.add(branch1)
        db_session.commit()

        # Create second branch with same name in different institution
        branch_data = {
            "name": "Same Name Branch",
            "branch_description": "Second branch",
            "address": "456 Second St",
            "capacity": 50,
            "institution_id": institution2.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Same Name Branch"

    @pytest.mark.api
    @pytest.mark.branches
    def test_update_branch_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful branch update."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch = Branch(
            name="Original Branch",
            branch_description="Original description",
            address="123 Original St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        update_data = {
            "name": "Updated Branch",
            "branch_description": "Updated description",
            "capacity": 150
        }

        response = client.put(f"/api/v1/branches/{branch.branch_id}", json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Branch"
        assert data["branch_description"] == "Updated description"
        assert data["capacity"] == 150

    @pytest.mark.api
    @pytest.mark.branches
    def test_update_branch_not_found(self, client):
        """Test update of non-existent branch."""
        update_data = {
            "name": "Updated Branch"
        }

        response = client.put("/api/v1/branches/999", json=update_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_update_branch_invalid_institution_id(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch update with invalid institution ID."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch = Branch(
            name="Test Branch",
            branch_description="Test description",
            address="123 Test St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        update_data = {
            "institution_id": 999  # Non-existent institution
        }

        response = client.put(f"/api/v1/branches/{branch.branch_id}", json=update_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "institution" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_delete_branch_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful branch deletion."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch = Branch(
            name="Branch to Delete",
            branch_description="Will be deleted",
            address="123 Delete St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        response = client.delete(f"/api/v1/branches/{branch.branch_id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify branch is deleted
        get_response = client.get(f"/api/v1/branches/{branch.branch_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    @pytest.mark.branches
    def test_delete_branch_not_found(self, client):
        """Test deletion of non-existent branch."""
        response = client.delete("/api/v1/branches/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_branches_by_institution(self, client, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of branches filtered by institution."""
        # Create test institutions
        institution1 = Institution(
            name="Institution 1",
            institution_description="First institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        institution2 = Institution(
            name="Institution 2",
            institution_description="Second institution",
            institution_type_id=sample_institution_types[1].institution_type_id,
            administrator_id=sample_administrators[1].user_id
        )
        db_session.add_all([institution1, institution2])
        db_session.commit()

        # Create branches for different institutions
        branch1 = Branch(
            name="Branch 1",
            branch_description="First branch",
            address="123 First St",
            capacity=100,
            institution_id=institution1.institution_id
        )
        branch2 = Branch(
            name="Branch 2",
            branch_description="Second branch",
            address="456 Second St",
            capacity=50,
            institution_id=institution1.institution_id  # Same institution
        )
        branch3 = Branch(
            name="Branch 3",
            branch_description="Third branch",
            address="789 Third St",
            capacity=75,
            institution_id=institution2.institution_id  # Different institution
        )
        
        db_session.add_all([branch1, branch2, branch3])
        db_session.commit()

        # Get branches for first institution
        response = client.get(f"/api/v1/branches/institution/{institution1.institution_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(branch["name"].startswith("Branch") for branch in data)

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_branches_by_institution_empty(self, client, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of branches by institution when none exist."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        response = client.get(f"/api/v1/branches/institution/{institution.institution_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.branches
    def test_get_branches_by_institution_invalid_id(self, client):
        """Test retrieval of branches by invalid institution ID."""
        response = client.get("/api/v1/branches/institution/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "institution" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_name_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch name validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test empty name
        branch_data = {
            "name": "",
            "branch_description": "Test description",
            "address": "123 Test St",
            "capacity": 100,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test very long name
        branch_data["name"] = "A" * 256  # Too long

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_capacity_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch capacity validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test negative capacity
        branch_data = {
            "name": "Test Branch",
            "branch_description": "Test description",
            "address": "123 Test St",
            "capacity": -10,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test zero capacity
        branch_data["capacity"] = 0

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_coordinates_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch coordinates validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test invalid latitude
        branch_data = {
            "name": "Test Branch",
            "branch_description": "Test description",
            "address": "123 Test St",
            "capacity": 100,
            "latitude": 91.0,  # Invalid latitude (> 90)
            "longitude": -74.0060,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test invalid longitude
        branch_data["latitude"] = 40.7128
        branch_data["longitude"] = 181.0  # Invalid longitude (> 180)

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_with_crowd_data(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch retrieval includes crowd data."""
        from app.models import CrowdData
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch = Branch(
            name="Branch with Crowd Data",
            branch_description="A branch with crowd data",
            address="123 Crowd St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        # Add crowd data
        crowd_data = CrowdData(
            branch_id=branch.branch_id,
            crowd_count=25,
            timestamp="2024-01-01T10:00:00"
        )
        db_session.add(crowd_data)
        db_session.commit()

        response = client.get(f"/api/v1/branches/{branch.branch_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "crowd_data" in data
        assert len(data["crowd_data"]) == 1
        assert data["crowd_data"][0]["crowd_count"] == 25

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_search(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch search functionality."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Create branches with different names
        branch1 = Branch(
            name="Main Hospital Branch",
            branch_description="Main hospital building",
            address="123 Main St",
            capacity=100,
            institution_id=institution.institution_id
        )
        branch2 = Branch(
            name="Emergency Services Branch",
            branch_description="Emergency services",
            address="456 Emergency St",
            capacity=50,
            institution_id=institution.institution_id
        )
        branch3 = Branch(
            name="Downtown Branch",
            branch_description="Downtown location",
            address="789 Downtown St",
            capacity=75,
            institution_id=institution.institution_id
        )
        
        db_session.add_all([branch1, branch2, branch3])
        db_session.commit()

        # Search for "hospital"
        response = client.get("/api/v1/branches/search?q=hospital")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Main Hospital Branch"

        # Search for "branch"
        response = client.get("/api/v1/branches/search?q=branch")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3  # All branches should match

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_search_empty(self, client):
        """Test branch search with no results."""
        response = client.get("/api/v1/branches/search?q=nonexistent")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_search_no_query(self, client):
        """Test branch search without query parameter."""
        response = client.get("/api/v1/branches/search")
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_address_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch address validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test very long address
        branch_data = {
            "name": "Test Branch",
            "branch_description": "Test description",
            "address": "A" * 501,  # Too long
            "capacity": 100,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_service_hours_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch service hours validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test very long service hours
        branch_data = {
            "name": "Test Branch",
            "branch_description": "Test description",
            "address": "123 Test St",
            "service_hours": "A" * 101,  # Too long
            "capacity": 100,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_service_description_validation(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch service description validation."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test very long service description
        branch_data = {
            "name": "Test Branch",
            "branch_description": "Test description",
            "address": "123 Test St",
            "service_description": "A" * 1001,  # Too long
            "capacity": 100,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.branches
    def test_branch_with_optional_fields_null(self, client, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with null optional fields."""
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch_data = {
            "name": "Minimal Branch",
            "branch_description": None,
            "address": None,
            "service_hours": None,
            "service_description": None,
            "latitude": None,
            "longitude": None,
            "capacity": 100,
            "institution_id": institution.institution_id
        }

        response = client.post("/api/v1/branches", json=branch_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Minimal Branch"
        assert data["branch_description"] is None
        assert data["address"] is None
        assert data["service_hours"] is None
        assert data["service_description"] is None
        assert data["latitude"] is None
        assert data["longitude"] is None
