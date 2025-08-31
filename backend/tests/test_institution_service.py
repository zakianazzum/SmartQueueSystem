import pytest
from sqlalchemy.orm import Session
from unittest.mock import Mock, patch

from app.services.institution_service import InstitutionService
from app.models import Institution, InstitutionType, User
from app.schemas.institution_schema import InstitutionCreate, InstitutionUpdate
from app.exceptions import InstitutionNotFoundError, InstitutionTypeNotFoundError, AdministratorNotFoundError, DuplicateInstitutionError


class TestInstitutionService:
    """Test cases for institution service layer."""

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_all_institutions_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of all institutions."""
        service = InstitutionService(db_session)
        
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

        institutions = service.get_all_institutions()
        
        assert len(institutions) == 2
        assert institutions[0].name == "City General Hospital"
        assert institutions[1].name == "Downtown Bank"

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_all_institutions_empty(self, db_session):
        """Test retrieval of institutions when none exist."""
        service = InstitutionService(db_session)
        
        institutions = service.get_all_institutions()
        
        assert len(institutions) == 0

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institution_by_id_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of institution by ID."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Test Hospital",
            institution_description="A test hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        result = service.get_institution_by_id(institution.institution_id)
        
        assert result.name == "Test Hospital"
        assert result.institution_description == "A test hospital"

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institution_by_id_not_found(self, db_session):
        """Test retrieval of non-existent institution."""
        service = InstitutionService(db_session)
        
        with pytest.raises(InstitutionNotFoundError):
            service.get_institution_by_id(999)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_create_institution_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful institution creation."""
        service = InstitutionService(db_session)
        
        institution_data = InstitutionCreate(
            name="New Hospital",
            institution_description="A new hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )

        result = service.create_institution(institution_data)
        
        assert result.name == "New Hospital"
        assert result.institution_description == "A new hospital"
        assert result.institution_type_id == sample_institution_types[0].institution_type_id
        assert result.administrator_id == sample_administrators[0].user_id
        assert result.institution_id is not None

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_create_institution_invalid_type_id(self, db_session, sample_administrators):
        """Test institution creation with invalid institution type ID."""
        service = InstitutionService(db_session)
        
        institution_data = InstitutionCreate(
            name="New Hospital",
            institution_description="A new hospital",
            institution_type_id=999,  # Non-existent type
            administrator_id=sample_administrators[0].user_id
        )

        with pytest.raises(InstitutionTypeNotFoundError):
            service.create_institution(institution_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_create_institution_invalid_administrator_id(self, db_session, sample_institution_types):
        """Test institution creation with invalid administrator ID."""
        service = InstitutionService(db_session)
        
        institution_data = InstitutionCreate(
            name="New Hospital",
            institution_description="A new hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=999  # Non-existent administrator
        )

        with pytest.raises(AdministratorNotFoundError):
            service.create_institution(institution_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_create_institution_duplicate_name(self, db_session, sample_institution_types, sample_administrators):
        """Test institution creation with duplicate name."""
        service = InstitutionService(db_session)
        
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
        institution_data = InstitutionCreate(
            name="Duplicate Hospital",
            institution_description="Second hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[1].user_id
        )

        with pytest.raises(DuplicateInstitutionError):
            service.create_institution(institution_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_update_institution_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful institution update."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Original Hospital",
            institution_description="Original description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        update_data = InstitutionUpdate(
            name="Updated Hospital",
            institution_description="Updated description"
        )

        result = service.update_institution(institution.institution_id, update_data)
        
        assert result.name == "Updated Hospital"
        assert result.institution_description == "Updated description"

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_update_institution_not_found(self, db_session):
        """Test update of non-existent institution."""
        service = InstitutionService(db_session)
        
        update_data = InstitutionUpdate(name="Updated Hospital")

        with pytest.raises(InstitutionNotFoundError):
            service.update_institution(999, update_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_update_institution_invalid_type_id(self, db_session, sample_institution_types, sample_administrators):
        """Test institution update with invalid institution type ID."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Test Hospital",
            institution_description="Test description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        update_data = InstitutionUpdate(institution_type_id=999)  # Non-existent type

        with pytest.raises(InstitutionTypeNotFoundError):
            service.update_institution(institution.institution_id, update_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_update_institution_invalid_administrator_id(self, db_session, sample_institution_types, sample_administrators):
        """Test institution update with invalid administrator ID."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Test Hospital",
            institution_description="Test description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        update_data = InstitutionUpdate(administrator_id=999)  # Non-existent administrator

        with pytest.raises(AdministratorNotFoundError):
            service.update_institution(institution.institution_id, update_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_delete_institution_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful institution deletion."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Hospital to Delete",
            institution_description="Will be deleted",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        service.delete_institution(institution.institution_id)
        
        # Verify institution is deleted
        with pytest.raises(InstitutionNotFoundError):
            service.get_institution_by_id(institution.institution_id)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_delete_institution_not_found(self, db_session):
        """Test deletion of non-existent institution."""
        service = InstitutionService(db_session)
        
        with pytest.raises(InstitutionNotFoundError):
            service.delete_institution(999)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_type(self, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of institutions filtered by type."""
        service = InstitutionService(db_session)
        
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
        hospitals = service.get_institutions_by_type(sample_institution_types[0].institution_type_id)
        
        assert len(hospitals) == 2
        assert all(inst.name.startswith("Hospital") for inst in hospitals)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_type_empty(self, db_session, sample_institution_types):
        """Test retrieval of institutions by type when none exist."""
        service = InstitutionService(db_session)
        
        institutions = service.get_institutions_by_type(sample_institution_types[0].institution_type_id)
        
        assert len(institutions) == 0

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_type_invalid_id(self, db_session):
        """Test retrieval of institutions by invalid type ID."""
        service = InstitutionService(db_session)
        
        with pytest.raises(InstitutionTypeNotFoundError):
            service.get_institutions_by_type(999)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_administrator(self, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of institutions filtered by administrator."""
        service = InstitutionService(db_session)
        
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
        institutions = service.get_institutions_by_administrator(sample_administrators[0].user_id)
        
        assert len(institutions) == 2
        assert all(inst.name.startswith("Institution") for inst in institutions)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_administrator_empty(self, db_session, sample_administrators):
        """Test retrieval of institutions by administrator when none exist."""
        service = InstitutionService(db_session)
        
        institutions = service.get_institutions_by_administrator(sample_administrators[0].user_id)
        
        assert len(institutions) == 0

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_get_institutions_by_administrator_invalid_id(self, db_session):
        """Test retrieval of institutions by invalid administrator ID."""
        service = InstitutionService(db_session)
        
        with pytest.raises(AdministratorNotFoundError):
            service.get_institutions_by_administrator(999)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_search_institutions(self, db_session, sample_institution_types, sample_administrators):
        """Test institution search functionality."""
        service = InstitutionService(db_session)
        
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
        results = service.search_institutions("hospital")
        
        assert len(results) == 2  # hospital and clinic (health clinic)
        assert any(inst.name == "City General Hospital" for inst in results)
        assert any(inst.name == "Community Clinic" for inst in results)

        # Search for "bank"
        results = service.search_institutions("bank")
        
        assert len(results) == 1
        assert results[0].name == "Downtown Bank"

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_search_institutions_empty(self, db_session):
        """Test institution search with no results."""
        service = InstitutionService(db_session)
        
        results = service.search_institutions("nonexistent")
        
        assert len(results) == 0

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_search_institutions_case_insensitive(self, db_session, sample_institution_types, sample_administrators):
        """Test institution search is case insensitive."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="City General Hospital",
            institution_description="A general hospital",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Search with different cases
        results1 = service.search_institutions("HOSPITAL")
        results2 = service.search_institutions("hospital")
        results3 = service.search_institutions("Hospital")
        
        assert len(results1) == 1
        assert len(results2) == 1
        assert len(results3) == 1
        assert results1[0].name == results2[0].name == results3[0].name

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_with_branches(self, db_session, sample_institution_types, sample_administrators):
        """Test institution retrieval includes branches."""
        from app.models import Branch
        
        service = InstitutionService(db_session)
        
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

        result = service.get_institution_by_id(institution.institution_id)
        
        assert len(result.branches) == 2
        assert result.branches[0].name == "Main Branch"
        assert result.branches[1].name == "Emergency Branch"

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_cascade_delete(self, db_session, sample_institution_types, sample_administrators):
        """Test that deleting institution also deletes associated branches."""
        from app.models import Branch
        
        service = InstitutionService(db_session)
        
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
        service.delete_institution(institution.institution_id)
        
        # Verify branch is also deleted
        branch_count = db_session.query(Branch).filter_by(branch_id=branch.branch_id).count()
        assert branch_count == 0

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_name_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test institution name validation."""
        service = InstitutionService(db_session)
        
        # Test empty name
        institution_data = InstitutionCreate(
            name="",
            institution_description="Test description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )

        with pytest.raises(ValueError):
            service.create_institution(institution_data)

        # Test very long name
        institution_data.name = "A" * 256  # Too long

        with pytest.raises(ValueError):
            service.create_institution(institution_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_description_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test institution description validation."""
        service = InstitutionService(db_session)
        
        # Test very long description
        institution_data = InstitutionCreate(
            name="Test Hospital",
            institution_description="A" * 1001,  # Too long
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )

        with pytest.raises(ValueError):
            service.create_institution(institution_data)

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_with_optional_fields_null(self, db_session, sample_institution_types, sample_administrators):
        """Test institution creation with null optional fields."""
        service = InstitutionService(db_session)
        
        institution_data = InstitutionCreate(
            name="Minimal Institution",
            institution_description=None,
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )

        result = service.create_institution(institution_data)
        
        assert result.name == "Minimal Institution"
        assert result.institution_description is None

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_update_partial_fields(self, db_session, sample_institution_types, sample_administrators):
        """Test institution update with partial fields."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Original Hospital",
            institution_description="Original description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Update only name
        update_data = InstitutionUpdate(name="Updated Hospital")

        result = service.update_institution(institution.institution_id, update_data)
        
        assert result.name == "Updated Hospital"
        assert result.institution_description == "Original description"  # Unchanged

    @pytest.mark.unit
    @pytest.mark.institutions
    def test_institution_update_no_fields(self, db_session, sample_institution_types, sample_administrators):
        """Test institution update with no fields."""
        service = InstitutionService(db_session)
        
        institution = Institution(
            name="Original Hospital",
            institution_description="Original description",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Update with no fields
        update_data = InstitutionUpdate()

        result = service.update_institution(institution.institution_id, update_data)
        
        assert result.name == "Original Hospital"  # Unchanged
        assert result.institution_description == "Original description"  # Unchanged
