from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
import uuid

from app.db.crud import CRUDBase
from app.db.session import get_db
from app.models import (
    Branch,
    Institution,
    InstitutionType,
    Administrator,
    User,
    CrowdData,
)
from app.schemas.institution_schema import (
    InstitutionCreate,
    InstitutionUpdate,
    BranchCreate,
    BranchUpdate,
    InstitutionTypeCreate,
    InstitutionTypeUpdate,
    InstitutionResponse,
    BranchResponse,
    InstitutionTypeResponse,
    AdministratorResponse,
)

institution_crud = CRUDBase(model=Institution)
branch_crud = CRUDBase(model=Branch)
institution_type_crud = CRUDBase(model=InstitutionType)


class InstitutionService:
    def __init__(self):
        pass

    def _transform_institution_type(self, institution_type: InstitutionType) -> InstitutionTypeResponse:
        """Transform SQLAlchemy institution type to response model"""
        return InstitutionTypeResponse(
            institutionTypeId=institution_type.InstitutionTypeId,
            institutionType=institution_type.InstitutionType
        )

    def _transform_administrator(self, administrator: Administrator) -> AdministratorResponse:
        """Transform SQLAlchemy administrator to response model"""
        return AdministratorResponse(
            userId=administrator.user.UserId,
            name=administrator.user.Name,
            email=administrator.user.Email
        )

    def _transform_branch(self, branch: Branch, total_crowd_count: int = 0) -> BranchResponse:
        """Transform SQLAlchemy branch to response model"""
        return BranchResponse(
            branchId=branch.BranchId,
            institutionId=branch.InstitutionId,
            name=branch.Name,
            branchDescription=branch.BranchDescription,
            address=branch.Address,
            serviceHours=branch.ServiceHours,
            serviceDescription=branch.ServiceDescription,
            latitude=branch.Latitude,
            longitude=branch.Longitude,
            capacity=branch.Capacity,
            totalCrowdCount=total_crowd_count
        )

    def _transform_institution(self, institution: Institution) -> InstitutionResponse:
        """Transform SQLAlchemy institution to response model"""
        # Transform branches
        branches = []
        for branch in institution.branches:
            total_crowd_count = getattr(branch, 'total_crowd_count', 0)
            branches.append(self._transform_branch(branch, total_crowd_count))

        # Transform institution type
        institution_type = None
        if institution.institution_type:
            institution_type = self._transform_institution_type(institution.institution_type)

        # Transform administrator
        administrator = None
        if institution.administrator:
            administrator = self._transform_administrator(institution.administrator)

        return InstitutionResponse(
            institutionId=institution.InstitutionId,
            institutionTypeId=institution.InstitutionTypeId,
            administratorId=institution.AdministratorId,
            name=institution.Name,
            institutionDescription=institution.InstitutionDescription,
            institutionType=institution_type,
            administrator=administrator,
            branches=branches
        )

    # Institution Type Methods
    def get_all_institution_types(self, db: Session) -> List[InstitutionTypeResponse]:
        """Get all institution types"""
        institution_types = db.query(InstitutionType).all()
        return [self._transform_institution_type(it) for it in institution_types]

    def get_institution_type_by_id(self, db: Session, institution_type_id: str) -> Optional[InstitutionTypeResponse]:
        """Get institution type by ID"""
        institution_type = db.query(InstitutionType).filter(InstitutionType.InstitutionTypeId == institution_type_id).first()
        if institution_type:
            return self._transform_institution_type(institution_type)
        return None

    def create_institution_type(self, db: Session, institution_type_data: InstitutionTypeCreate) -> InstitutionTypeResponse:
        """Create a new institution type"""
        institution_type_id = str(uuid.uuid4())
        db_institution_type = InstitutionType(
            InstitutionTypeId=institution_type_id,
            InstitutionType=institution_type_data.institutionType
        )
        db.add(db_institution_type)
        db.commit()
        db.refresh(db_institution_type)
        return self._transform_institution_type(db_institution_type)

    def update_institution_type(self, db: Session, institution_type_id: str, institution_type_data: InstitutionTypeUpdate) -> Optional[InstitutionTypeResponse]:
        """Update institution type"""
        db_institution_type = db.query(InstitutionType).filter(InstitutionType.InstitutionTypeId == institution_type_id).first()
        if not db_institution_type:
            return None
        
        for field, value in institution_type_data.dict(exclude_unset=True).items():
            setattr(db_institution_type, field.title(), value)
        
        db.commit()
        db.refresh(db_institution_type)
        return self._transform_institution_type(db_institution_type)

    def delete_institution_type(self, db: Session, institution_type_id: str) -> bool:
        """Delete institution type"""
        db_institution_type = db.query(InstitutionType).filter(InstitutionType.InstitutionTypeId == institution_type_id).first()
        if not db_institution_type:
            return False
        
        db.delete(db_institution_type)
        db.commit()
        return True

    # Institution Methods
    def get_all_institutions(self, db: Session) -> List[InstitutionResponse]:
        """Get all institutions with related data"""
        institutions = (
            db.query(Institution)
            .options(
                joinedload(Institution.branches),
                joinedload(Institution.institution_type),
                joinedload(Institution.administrator).joinedload(Administrator.user),
            )
            .all()
        )

        if not institutions:
            return []

        # Calculate total crowd count for each branch
        for institution in institutions:
            for branch in institution.branches:
                latest_crowd_data = (
                    db.query(CrowdData.CurrentCrowdCount)
                    .filter(CrowdData.BranchId == branch.BranchId)
                    .order_by(CrowdData.Timestamp.desc())
                    .first()
                )
                branch.total_crowd_count = latest_crowd_data.CurrentCrowdCount if latest_crowd_data else 0

        return [self._transform_institution(institution) for institution in institutions]

    def get_institution_by_id(self, db: Session, institution_id: str) -> Optional[InstitutionResponse]:
        """Get institution by ID with related data"""
        institution = (
            db.query(Institution)
            .options(
                joinedload(Institution.branches),
                joinedload(Institution.institution_type),
                joinedload(Institution.administrator).joinedload(Administrator.user),
            )
            .filter(Institution.InstitutionId == institution_id)
            .first()
        )

        if institution:
            # Calculate total crowd count for each branch
            for branch in institution.branches:
                latest_crowd_data = (
                    db.query(CrowdData.CurrentCrowdCount)
                    .filter(CrowdData.BranchId == branch.BranchId)
                    .order_by(CrowdData.Timestamp.desc())
                    .first()
                )
                branch.total_crowd_count = latest_crowd_data.CurrentCrowdCount if latest_crowd_data else 0

            return self._transform_institution(institution)
        return None

    def create_institution(self, db: Session, institution_data: InstitutionCreate) -> InstitutionResponse:
        """Create a new institution"""
        institution_id = str(uuid.uuid4())
        db_institution = Institution(
            InstitutionId=institution_id,
            InstitutionTypeId=institution_data.institutionTypeId,
            AdministratorId=institution_data.administratorId,
            Name=institution_data.name,
            InstitutionDescription=institution_data.institutionDescription
        )
        db.add(db_institution)
        db.commit()
        db.refresh(db_institution)
        return self._transform_institution(db_institution)

    def update_institution(self, db: Session, institution_id: str, institution_data: InstitutionUpdate) -> Optional[InstitutionResponse]:
        """Update institution"""
        db_institution = db.query(Institution).filter(Institution.InstitutionId == institution_id).first()
        if not db_institution:
            return None
        
        update_data = institution_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "name":
                setattr(db_institution, "Name", value)
            elif field == "institutionDescription":
                setattr(db_institution, "InstitutionDescription", value)
            elif field == "institutionTypeId":
                setattr(db_institution, "InstitutionTypeId", value)
            elif field == "administratorId":
                setattr(db_institution, "AdministratorId", value)
        
        db.commit()
        db.refresh(db_institution)
        return self._transform_institution(db_institution)

    def delete_institution(self, db: Session, institution_id: str) -> bool:
        """Delete institution"""
        db_institution = db.query(Institution).filter(Institution.InstitutionId == institution_id).first()
        if not db_institution:
            return False
        
        db.delete(db_institution)
        db.commit()
        return True

    # Branch Methods
    def get_all_branches(self, db: Session) -> List[BranchResponse]:
        """Get all branches with crowd count"""
        branches = db.query(Branch).all()
        
        result = []
        for branch in branches:
            latest_crowd_data = (
                db.query(CrowdData.CurrentCrowdCount)
                .filter(CrowdData.BranchId == branch.BranchId)
                .order_by(CrowdData.Timestamp.desc())
                .first()
            )
            result.append(self._transform_branch(branch, latest_crowd_data.CurrentCrowdCount if latest_crowd_data else 0))
        
        return result

    def get_branches_by_institution_id(self, db: Session, institution_id: str) -> List[BranchResponse]:
        """Get branches by institution ID"""
        branches = db.query(Branch).filter(Branch.InstitutionId == institution_id).all()
        
        result = []
        for branch in branches:
            latest_crowd_data = (
                db.query(CrowdData.CurrentCrowdCount)
                .filter(CrowdData.BranchId == branch.BranchId)
                .order_by(CrowdData.Timestamp.desc())
                .first()
            )
            result.append(self._transform_branch(branch, latest_crowd_data.CurrentCrowdCount if latest_crowd_data else 0))
        
        return result

    def get_branch_by_id(self, db: Session, branch_id: str) -> Optional[BranchResponse]:
        """Get branch by ID with crowd count"""
        branch = db.query(Branch).filter(Branch.BranchId == branch_id).first()
        
        if branch:
            latest_crowd_data = (
                db.query(CrowdData.CurrentCrowdCount)
                .filter(CrowdData.BranchId == branch.BranchId)
                .order_by(CrowdData.Timestamp.desc())
                .first()
            )
            return self._transform_branch(branch, latest_crowd_data.CurrentCrowdCount if latest_crowd_data else 0)
        return None

    def create_branch(self, db: Session, branch_data: BranchCreate) -> BranchResponse:
        """Create a new branch"""
        # Verify institution exists
        institution = db.query(Institution).filter(Institution.InstitutionId == branch_data.institutionId).first()
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institution not found"
            )
        
        branch_id = str(uuid.uuid4())
        db_branch = Branch(
            BranchId=branch_id,
            InstitutionId=branch_data.institutionId,
            Name=branch_data.name,
            BranchDescription=branch_data.branchDescription,
            Address=branch_data.address,
            ServiceHours=branch_data.serviceHours,
            ServiceDescription=branch_data.serviceDescription,
            Latitude=branch_data.latitude,
            Longitude=branch_data.longitude,
            Capacity=branch_data.capacity
        )
        db.add(db_branch)
        db.commit()
        db.refresh(db_branch)
        return self._transform_branch(db_branch)

    def update_branch(self, db: Session, branch_id: str, branch_data: BranchUpdate) -> Optional[BranchResponse]:
        """Update branch"""
        db_branch = db.query(Branch).filter(Branch.BranchId == branch_id).first()
        if not db_branch:
            return None
        
        update_data = branch_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "name":
                setattr(db_branch, "Name", value)
            elif field == "branchDescription":
                setattr(db_branch, "BranchDescription", value)
            elif field == "address":
                setattr(db_branch, "Address", value)
            elif field == "serviceHours":
                setattr(db_branch, "ServiceHours", value)
            elif field == "serviceDescription":
                setattr(db_branch, "ServiceDescription", value)
            elif field == "latitude":
                setattr(db_branch, "Latitude", value)
            elif field == "longitude":
                setattr(db_branch, "Longitude", value)
            elif field == "capacity":
                setattr(db_branch, "Capacity", value)
        
        db.commit()
        db.refresh(db_branch)
        return self._transform_branch(db_branch)

    def delete_branch(self, db: Session, branch_id: str) -> bool:
        """Delete branch"""
        db_branch = db.query(Branch).filter(Branch.BranchId == branch_id).first()
        if not db_branch:
            return False
        
        db.delete(db_branch)
        db.commit()
        return True


institution_service = InstitutionService()
