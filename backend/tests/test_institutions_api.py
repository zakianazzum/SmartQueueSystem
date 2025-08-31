import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.models import Institution, InstitutionType, User
from app.schemas.institution_schema import InstitutionCreate, InstitutionUpdate


class TestInstitutionsAPI:
    """Test cases for institutions API endpoints."""

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_all_institutions_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of all institutions."""
        # Create test institutions
        institution1 = Institution(
            name="City General Hospital",
            institution_description="A general hospital serving the city",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        institution2 = Institution(
            name="Downtown Bank",
            institution_description="Main banking branch",
            institution_type_id=sample_institution_types[1].institution_type_id,
            administrator_id=sample_administrators[1].user_id
        )
        
        db_session.add_all([institution1, institution2])
        db_session.commit()

        response = client.get("/api/v1/institutions")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "City General Hospital"
        assert data[1]["name"] == "Downtown Bank"

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_all_institutions_empty(self, client):
        """Test retrieval of institutions when none exist."""
        response = client.get("/api/v1/institutions")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institution_by_id_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of institution by ID."""
        institution = Institution(
            name="Test Hospital",
            institution_description="A test hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        response = client.get(f"/api/v1/institutions/{institution.institution_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Hospital"
        assert data["institution_description"] == "A test hospital"

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institution_by_id_not_found(self, client):
        """Test retrieval of non-existent institution."""
        response = client.get("/api/v1/institutions/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_create_institution_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful institution creation."""
        institution_data = {
            "name": "New Hospital",
            "institution_description": "A new hospital",
            "institution_type_id": sample_institution_types[0].institution_type_id,
            "administrator_id": sample_administrators[0].user_id
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Hospital"
        assert data["institution_description"] == "A new hospital"
        assert "institution_id" in data

    @pytest.mark.api
    @pytest.mark.institutions
    def test_create_institution_missing_required_fields(self, client):
        """Test institution creation with missing required fields."""
        # Missing name
        institution_data = {
            "institution_description": "A hospital without name"
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.institutions
    def test_create_institution_invalid_type_id(self, client, sample_administrators):
        """Test institution creation with invalid institution type ID."""
        institution_data = {
            "name": "New Hospital",
            "institution_description": "A new hospital",
            "institution_type_id": 999,  # Non-existent type
            "administrator_id": sample_administrators[0].user_id
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "institution type" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_create_institution_invalid_administrator_id(self, client, sample_institution_types):
        """Test institution creation with invalid administrator ID."""
        institution_data = {
            "name": "New Hospital",
            "institution_description": "A new hospital",
            "institution_type_id": sample_institution_types[0].institution_type_id,
            "administrator_id": 999  # Non-existent administrator
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "administrator" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_create_institution_duplicate_name(self, client, db_session, sample_institution_types, sample_administrators):
        """Test institution creation with duplicate name."""
        # Create first institution
        institution1 = Institution(
            name="Duplicate Hospital",
            institution_description="First hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution1)
        db_session.commit()

        # Try to create second institution with same name
        institution_data = {
            "name": "Duplicate Hospital",
            "institution_description": "Second hospital",
            "institution_type_id": sample_institution_types[0].institution_type_id,
            "administrator_id": sample_administrators[1].user_id
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "already exists" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_update_institution_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful institution update."""
        institution = Institution(
            name="Original Hospital",
            institution_description="Original description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        update_data = {
            "name": "Updated Hospital",
            "institution_description": "Updated description"
        }

        response = client.put(f"/api/v1/institutions/{institution.institution_id}", json=update_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Hospital"
        assert data["institution_description"] == "Updated description"

    @pytest.mark.api
    @pytest.mark.institutions
    def test_update_institution_not_found(self, client):
        """Test update of non-existent institution."""
        update_data = {
            "name": "Updated Hospital"
        }

        response = client.put("/api/v1/institutions/999", json=update_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_update_institution_invalid_type_id(self, client, db_session, sample_institution_types, sample_administrators):
        """Test institution update with invalid institution type ID."""
        institution = Institution(
            name="Test Hospital",
            institution_description="Test description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        update_data = {
            "institution_type_id": 999  # Non-existent type
        }

        response = client.put(f"/api/v1/institutions/{institution.institution_id}", json=update_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "institution type" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_delete_institution_success(self, client, db_session, sample_institution_types, sample_administrators):
        """Test successful institution deletion."""
        institution = Institution(
            name="Hospital to Delete",
            institution_description="Will be deleted",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        response = client.delete(f"/api/v1/institutions/{institution.institution_id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify institution is deleted
        get_response = client.get(f"/api/v1/institutions/{institution.institution_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    @pytest.mark.institutions
    def test_delete_institution_not_found(self, client):
        """Test deletion of non-existent institution."""
        response = client.delete("/api/v1/institutions/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_type(self, client, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of institutions filtered by type."""
        # Create institutions of different types
        hospital1 = Institution(
            name="Hospital 1",
            institution_description="First hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,  # Hospital
            administrator_id=sample_administrators[0].user_id
        )
        hospital2 = Institution(
            name="Hospital 2",
            institution_description="Second hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,  # Hospital
            administrator_id=sample_administrators[1].user_id
        )
        bank = Institution(
            name="Bank 1",
            institution_description="First bank",
            institution_type_id=sample_institution_types[1].institution_type_id,  # Bank
            administrator_id=sample_administrators[0].user_id
        )
        
        db_session.add_all([hospital1, hospital2, bank])
        db_session.commit()

        # Get hospitals only
        response = client.get(f"/api/v1/institutions/type/{sample_institution_types[0].institution_type_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(inst["name"].startswith("Hospital") for inst in data)

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_type_empty(self, client, sample_institution_types):
        """Test retrieval of institutions by type when none exist."""
        response = client.get(f"/api/v1/institutions/type/{sample_institution_types[0].institution_type_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_type_invalid_id(self, client):
        """Test retrieval of institutions by invalid type ID."""
        response = client.get("/api/v1/institutions/type/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "institution type" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_administrator(self, client, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of institutions filtered by administrator."""
        # Create institutions with different administrators
        inst1 = Institution(
            name="Institution 1",
            institution_description="First institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        inst2 = Institution(
            name="Institution 2",
            institution_description="Second institution",
            institution_type_id=sample_institution_types[1].institution_type_id,
            administrator_id=sample_administrators[0].user_id  # Same administrator
        )
        inst3 = Institution(
            name="Institution 3",
            institution_description="Third institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[1].user_id  # Different administrator
        )
        
        db_session.add_all([inst1, inst2, inst3])
        db_session.commit()

        # Get institutions for first administrator
        response = client.get(f"/api/v1/institutions/administrator/{sample_administrators[0].user_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(inst["name"].startswith("Institution") for inst in data)

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_administrator_empty(self, client, sample_administrators):
        """Test retrieval of institutions by administrator when none exist."""
        response = client.get(f"/api/v1/institutions/administrator/{sample_administrators[0].user_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.institutions
    def test_get_institutions_by_administrator_invalid_id(self, client):
        """Test retrieval of institutions by invalid administrator ID."""
        response = client.get("/api/v1/institutions/administrator/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "administrator" in data["detail"].lower()

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_name_validation(self, client, sample_institution_types, sample_administrators):
        """Test institution name validation."""
        # Test empty name
        institution_data = {
            "name": "",
            "institution_description": "Test description",
            "institution_type_id": sample_institution_types[0].institution_type_id,
            "administrator_id": sample_administrators[0].user_id
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Test very long name
        institution_data["name"] = "A" * 256  # Too long

        response = client.post("/api/v1/institutions", json=institution_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_description_validation(self, client, sample_institution_types, sample_administrators):
        """Test institution description validation."""
        # Test very long description
        institution_data = {
            "name": "Test Hospital",
            "institution_description": "A" * 1001,  # Too long
            "institution_type_id": sample_institution_types[0].institution_type_id,
            "administrator_id": sample_administrators[0].user_id
        }

        response = client.post("/api/v1/institutions", json=institution_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_with_branches(self, client, db_session, sample_institution_types, sample_administrators):
        """Test institution retrieval includes branches."""
        from app.models import Branch
        
        institution = Institution(
            name="Hospital with Branches",
            institution_description="A hospital with multiple branches",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Add branches
        branch1 = Branch(
            name="Main Branch",
            branch_description="Main hospital building",
            address="123 Main St",
            institution_id=institution.institution_id,
            capacity=100
        )
        branch2 = Branch(
            name="Emergency Branch",
            branch_description="Emergency services",
            address="456 Emergency St",
            institution_id=institution.institution_id,
            capacity=50
        )
        db_session.add_all([branch1, branch2])
        db_session.commit()

        response = client.get(f"/api/v1/institutions/{institution.institution_id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["branches"]) == 2
        assert data["branches"][0]["name"] == "Main Branch"
        assert data["branches"][1]["name"] == "Emergency Branch"

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_cascade_delete(self, client, db_session, sample_institution_types, sample_administrators):
        """Test that deleting institution also deletes associated branches."""
        from app.models import Branch
        
        institution = Institution(
            name="Hospital to Delete",
            institution_description="Will be deleted with branches",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Add branches
        branch = Branch(
            name="Branch to Delete",
            branch_description="Will be deleted with institution",
            address="123 Delete St",
            institution_id=institution.institution_id,
            capacity=100
        )
        db_session.add(branch)
        db_session.commit()

        # Delete institution
        response = client.delete(f"/api/v1/institutions/{institution.institution_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify branch is also deleted
        branch_response = client.get(f"/api/v1/branches/{branch.branch_id}")
        assert branch_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_search(self, client, db_session, sample_institution_types, sample_administrators):
        """Test institution search functionality."""
        # Create institutions with different names
        hospital = Institution(
            name="City General Hospital",
            institution_description="A general hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        bank = Institution(
            name="Downtown Bank",
            institution_description="A banking institution",
            institution_type_id=sample_institution_types[1].institution_type_id,
            administrator_id=sample_administrators[1].user_id
        )
        clinic = Institution(
            name="Community Clinic",
            institution_description="A community health clinic",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        
        db_session.add_all([hospital, bank, clinic])
        db_session.commit()

        # Search for "hospital"
        response = client.get("/api/v1/institutions/search?q=hospital")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2  # hospital and clinic (health clinic)
        assert any(inst["name"] == "City General Hospital" for inst in data)
        assert any(inst["name"] == "Community Clinic" for inst in data)

        # Search for "bank"
        response = client.get("/api/v1/institutions/search?q=bank")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Downtown Bank"

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_search_empty(self, client):
        """Test institution search with no results."""
        response = client.get("/api/v1/institutions/search?q=nonexistent")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 0

    @pytest.mark.api
    @pytest.mark.institutions
    def test_institution_search_no_query(self, client):
        """Test institution search without query parameter."""
        response = client.get("/api/v1/institutions/search")
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
