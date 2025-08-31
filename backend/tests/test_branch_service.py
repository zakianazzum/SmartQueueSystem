import pytest
from sqlalchemy.orm import Session
from unittest.mock import Mock, patch

from app.services.branch_service import BranchService
from app.models import Branch, Institution, InstitutionType, User
from app.schemas.branch_schema import BranchCreate, BranchUpdate
from app.exceptions import BranchNotFoundError, InstitutionNotFoundError, DuplicateBranchError


class TestBranchService:
    """Test cases for branch service layer."""

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_all_branches_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of all branches."""
        service = BranchService(db_session)
        
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

        branches = service.get_all_branches()
        
        assert len(branches) == 2
        assert branches[0].name == "Main Branch"
        assert branches[1].name == "Emergency Branch"

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_all_branches_empty(self, db_session):
        """Test retrieval of branches when none exist."""
        service = BranchService(db_session)
        
        branches = service.get_all_branches()
        
        assert len(branches) == 0

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_branch_by_id_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful retrieval of branch by ID."""
        service = BranchService(db_session)
        
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

        result = service.get_branch_by_id(branch.branch_id)
        
        assert result.name == "Test Branch"
        assert result.branch_description == "A test branch"

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_branch_by_id_not_found(self, db_session):
        """Test retrieval of non-existent branch."""
        service = BranchService(db_session)
        
        with pytest.raises(BranchNotFoundError):
            service.get_branch_by_id(999)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_create_branch_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful branch creation."""
        service = BranchService(db_session)
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch_data = BranchCreate(
            name="New Branch",
            branch_description="A new branch",
            address="789 New St",
            service_hours="9 AM - 5 PM",
            service_description="General services",
            latitude=40.7128,
            longitude=-74.0060,
            capacity=75,
            institution_id=institution.institution_id
        )

        result = service.create_branch(branch_data)
        
        assert result.name == "New Branch"
        assert result.branch_description == "A new branch"
        assert result.institution_id == institution.institution_id
        assert result.branch_id is not None

    @pytest.mark.unit
    @pytest.mark.branches
    def test_create_branch_invalid_institution_id(self, db_session):
        """Test branch creation with invalid institution ID."""
        service = BranchService(db_session)
        
        branch_data = BranchCreate(
            name="New Branch",
            branch_description="A new branch",
            address="789 New St",
            capacity=75,
            institution_id=999  # Non-existent institution
        )

        with pytest.raises(InstitutionNotFoundError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_create_branch_duplicate_name_same_institution(self, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with duplicate name in same institution."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Duplicate Branch",
            branch_description="Second branch",
            address="456 Second St",
            capacity=50,
            institution_id=institution.institution_id
        )

        with pytest.raises(DuplicateBranchError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_create_branch_same_name_different_institution(self, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with same name in different institutions (should succeed)."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Same Name Branch",
            branch_description="Second branch",
            address="456 Second St",
            capacity=50,
            institution_id=institution2.institution_id
        )

        result = service.create_branch(branch_data)
        
        assert result.name == "Same Name Branch"
        assert result.institution_id == institution2.institution_id

    @pytest.mark.unit
    @pytest.mark.branches
    def test_update_branch_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful branch update."""
        service = BranchService(db_session)
        
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

        update_data = BranchUpdate(
            name="Updated Branch",
            branch_description="Updated description",
            capacity=150
        )

        result = service.update_branch(branch.branch_id, update_data)
        
        assert result.name == "Updated Branch"
        assert result.branch_description == "Updated description"
        assert result.capacity == 150

    @pytest.mark.unit
    @pytest.mark.branches
    def test_update_branch_not_found(self, db_session):
        """Test update of non-existent branch."""
        service = BranchService(db_session)
        
        update_data = BranchUpdate(name="Updated Branch")

        with pytest.raises(BranchNotFoundError):
            service.update_branch(999, update_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_update_branch_invalid_institution_id(self, db_session, sample_institution_types, sample_administrators):
        """Test branch update with invalid institution ID."""
        service = BranchService(db_session)
        
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

        update_data = BranchUpdate(institution_id=999)  # Non-existent institution

        with pytest.raises(InstitutionNotFoundError):
            service.update_branch(branch.branch_id, update_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_delete_branch_success(self, db_session, sample_institution_types, sample_administrators):
        """Test successful branch deletion."""
        service = BranchService(db_session)
        
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

        service.delete_branch(branch.branch_id)
        
        # Verify branch is deleted
        with pytest.raises(BranchNotFoundError):
            service.get_branch_by_id(branch.branch_id)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_delete_branch_not_found(self, db_session):
        """Test deletion of non-existent branch."""
        service = BranchService(db_session)
        
        with pytest.raises(BranchNotFoundError):
            service.delete_branch(999)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_branches_by_institution(self, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of branches filtered by institution."""
        service = BranchService(db_session)
        
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
        branches = service.get_branches_by_institution(institution1.institution_id)
        
        assert len(branches) == 2
        assert all(branch.name.startswith("Branch") for branch in branches)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_branches_by_institution_empty(self, db_session, sample_institution_types, sample_administrators):
        """Test retrieval of branches by institution when none exist."""
        service = BranchService(db_session)
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branches = service.get_branches_by_institution(institution.institution_id)
        
        assert len(branches) == 0

    @pytest.mark.unit
    @pytest.mark.branches
    def test_get_branches_by_institution_invalid_id(self, db_session):
        """Test retrieval of branches by invalid institution ID."""
        service = BranchService(db_session)
        
        with pytest.raises(InstitutionNotFoundError):
            service.get_branches_by_institution(999)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_name_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch name validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="",
            branch_description="Test description",
            address="123 Test St",
            capacity=100,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

        # Test very long name
        branch_data.name = "A" * 256  # Too long

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_capacity_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch capacity validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Test Branch",
            branch_description="Test description",
            address="123 Test St",
            capacity=-10,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

        # Test zero capacity
        branch_data.capacity = 0

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_coordinates_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch coordinates validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Test Branch",
            branch_description="Test description",
            address="123 Test St",
            capacity=100,
            latitude=91.0,  # Invalid latitude (> 90)
            longitude=-74.0060,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

        # Test invalid longitude
        branch_data.latitude = 40.7128
        branch_data.longitude = 181.0  # Invalid longitude (> 180)

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_with_crowd_data(self, db_session, sample_institution_types, sample_administrators):
        """Test branch retrieval includes crowd data."""
        from app.models import CrowdData
        
        service = BranchService(db_session)
        
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

        result = service.get_branch_by_id(branch.branch_id)
        
        assert len(result.crowd_data) == 1
        assert result.crowd_data[0].crowd_count == 25

    @pytest.mark.unit
    @pytest.mark.branches
    def test_search_branches(self, db_session, sample_institution_types, sample_administrators):
        """Test branch search functionality."""
        service = BranchService(db_session)
        
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
        results = service.search_branches("hospital")
        
        assert len(results) == 1
        assert results[0].name == "Main Hospital Branch"

        # Search for "branch"
        results = service.search_branches("branch")
        
        assert len(results) == 3  # All branches should match

    @pytest.mark.unit
    @pytest.mark.branches
    def test_search_branches_empty(self, db_session):
        """Test branch search with no results."""
        service = BranchService(db_session)
        
        results = service.search_branches("nonexistent")
        
        assert len(results) == 0

    @pytest.mark.unit
    @pytest.mark.branches
    def test_search_branches_case_insensitive(self, db_session, sample_institution_types, sample_administrators):
        """Test branch search is case insensitive."""
        service = BranchService(db_session)
        
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
            name="City General Hospital Branch",
            branch_description="A general hospital branch",
            address="123 Main St",
            capacity=100,
            institution_id=institution.institution_id
        )
        db_session.add(branch)
        db_session.commit()

        # Search with different cases
        results1 = service.search_branches("HOSPITAL")
        results2 = service.search_branches("hospital")
        results3 = service.search_branches("Hospital")
        
        assert len(results1) == 1
        assert len(results2) == 1
        assert len(results3) == 1
        assert results1[0].name == results2[0].name == results3[0].name

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_address_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch address validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Test Branch",
            branch_description="Test description",
            address="A" * 501,  # Too long
            capacity=100,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_service_hours_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch service hours validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Test Branch",
            branch_description="Test description",
            address="123 Test St",
            service_hours="A" * 101,  # Too long
            capacity=100,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_service_description_validation(self, db_session, sample_institution_types, sample_administrators):
        """Test branch service description validation."""
        service = BranchService(db_session)
        
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
        branch_data = BranchCreate(
            name="Test Branch",
            branch_description="Test description",
            address="123 Test St",
            service_description="A" * 1001,  # Too long
            capacity=100,
            institution_id=institution.institution_id
        )

        with pytest.raises(ValueError):
            service.create_branch(branch_data)

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_with_optional_fields_null(self, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with null optional fields."""
        service = BranchService(db_session)
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch_data = BranchCreate(
            name="Minimal Branch",
            branch_description=None,
            address=None,
            service_hours=None,
            service_description=None,
            latitude=None,
            longitude=None,
            capacity=100,
            institution_id=institution.institution_id
        )

        result = service.create_branch(branch_data)
        
        assert result.name == "Minimal Branch"
        assert result.branch_description is None
        assert result.address is None
        assert result.service_hours is None
        assert result.service_description is None
        assert result.latitude is None
        assert result.longitude is None

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_update_partial_fields(self, db_session, sample_institution_types, sample_administrators):
        """Test branch update with partial fields."""
        service = BranchService(db_session)
        
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

        # Update only name
        update_data = BranchUpdate(name="Updated Branch")

        result = service.update_branch(branch.branch_id, update_data)
        
        assert result.name == "Updated Branch"
        assert result.branch_description == "Original description"  # Unchanged

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_update_no_fields(self, db_session, sample_institution_types, sample_administrators):
        """Test branch update with no fields."""
        service = BranchService(db_session)
        
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

        # Update with no fields
        update_data = BranchUpdate()

        result = service.update_branch(branch.branch_id, update_data)
        
        assert result.name == "Original Branch"  # Unchanged
        assert result.branch_description == "Original description"  # Unchanged

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_with_special_characters(self, db_session, sample_institution_types, sample_administrators):
        """Test branch creation with special characters in names."""
        service = BranchService(db_session)
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        branch_data = BranchCreate(
            name="Branch & Co. (Downtown)",
            branch_description="A branch with special characters",
            address="123 Main St, Suite #100",
            capacity=100,
            institution_id=institution.institution_id
        )

        result = service.create_branch(branch_data)
        
        assert result.name == "Branch & Co. (Downtown)"
        assert result.address == "123 Main St, Suite #100"

    @pytest.mark.unit
    @pytest.mark.branches
    def test_branch_capacity_edge_cases(self, db_session, sample_institution_types, sample_administrators):
        """Test branch capacity edge cases."""
        service = BranchService(db_session)
        
        # Create test institution
        institution = Institution(
            name="Test Institution",
            institution_description="A test institution",
            institution_type_id=sample_institution_types[0].institution_type_id,
            administrator_id=sample_administrators[0].user_id
        )
        db_session.add(institution)
        db_session.commit()

        # Test minimum valid capacity
        branch_data = BranchCreate(
            name="Minimal Capacity Branch",
            branch_description="Test description",
            address="123 Test St",
            capacity=1,
            institution_id=institution.institution_id
        )

        result = service.create_branch(branch_data)
        assert result.capacity == 1

        # Test maximum reasonable capacity
        branch_data = BranchCreate(
            name="Max Capacity Branch",
            branch_description="Test description",
            address="456 Test St",
            capacity=10000,
            institution_id=institution.institution_id
        )

        result = service.create_branch(branch_data)
        assert result.capacity == 10000
