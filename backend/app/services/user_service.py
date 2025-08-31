from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.crud import CRUDBase
from app.db.session import get_db
from app.models import (
    User,
    Operator,
    Visitor,
    Administrator,
    FavoriteInstitution,
    AlertPreference,
    Branch,
)
from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserResponse,
    OperatorCreate,
    OperatorUpdate,
    OperatorResponse,
    VisitorCreate,
    VisitorResponse,
    FavoriteInstitutionCreate,
    FavoriteInstitutionUpdate,
    FavoriteInstitutionResponse,
    AlertPreferenceCreate,
    AlertPreferenceUpdate,
    AlertPreferenceResponse,
    AdministratorCreate,
    AdministratorResponse,
    BranchInfo,
)

user_crud = CRUDBase(model=User)
operator_crud = CRUDBase(model=Operator)
visitor_crud = CRUDBase(model=Visitor)
administrator_crud = CRUDBase(model=Administrator)
favorite_institution_crud = CRUDBase(model=FavoriteInstitution)
alert_preference_crud = CRUDBase(model=AlertPreference)


class UserService:
    def __init__(self):
        pass

    def _transform_user(self, user: User) -> UserResponse:
        """Transform SQLAlchemy user to response model"""
        return UserResponse(
            userId=user.UserId,
            name=user.Name,
            email=user.Email,
            role=user.Role,
            createdAt=user.CreatedAt,
            updatedAt=user.UpdatedAt
        )

    def _transform_branch_info(self, branch: Branch) -> BranchInfo:
        """Transform SQLAlchemy branch to basic info"""
        return BranchInfo(
            branchId=branch.BranchId,
            name=branch.Name,
            address=branch.Address,
            serviceHours=branch.ServiceHours
        )

    # User Methods
    def get_all_users(self, db: Session) -> List[UserResponse]:
        """Get all users"""
        users = db.query(User).all()
        return [self._transform_user(user) for user in users]

    def get_user_by_id(self, db: Session, user_id: str) -> Optional[UserResponse]:
        """Get user by ID"""
        user = db.query(User).filter(User.UserId == user_id).first()
        if user:
            return self._transform_user(user)
        return None

    def create_user(self, db: Session, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        user_id = str(uuid.uuid4())
        now = datetime.now()
        db_user = User(
            UserId=user_id,
            Name=user_data.name,
            Email=user_data.email,
            Role=user_data.role,
            Password=user_data.password,  # In production, hash this password
            CreatedAt=now,
            UpdatedAt=now
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return self._transform_user(db_user)

    def update_user(self, db: Session, user_id: str, user_data: UserUpdate) -> Optional[UserResponse]:
        """Update user"""
        db_user = db.query(User).filter(User.UserId == user_id).first()
        if not db_user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "name":
                setattr(db_user, "Name", value)
            elif field == "email":
                setattr(db_user, "Email", value)
            elif field == "role":
                setattr(db_user, "Role", value)
            elif field == "password":
                setattr(db_user, "Password", value)  # In production, hash this password
        
        db_user.UpdatedAt = datetime.now()
        db.commit()
        db.refresh(db_user)
        return self._transform_user(db_user)

    def delete_user(self, db: Session, user_id: str) -> bool:
        """Delete user"""
        db_user = db.query(User).filter(User.UserId == user_id).first()
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        return True

    # Operator Methods
    def get_all_operators(self, db: Session) -> List[OperatorResponse]:
        """Get all operators with user and branch info"""
        operators = (
            db.query(Operator)
            .options(
                joinedload(Operator.user),
                joinedload(Operator.branch)
            )
            .all()
        )
        
        result = []
        for operator in operators:
            branch_info = None
            if operator.branch:
                branch_info = self._transform_branch_info(operator.branch)
            
            result.append(OperatorResponse(
                userId=operator.UserId,
                branchId=operator.BranchId,
                user=self._transform_user(operator.user),
                branch=branch_info.dict() if branch_info else None
            ))
        
        return result

    def get_operators_by_branch_id(self, db: Session, branch_id: str) -> List[OperatorResponse]:
        """Get operators by branch ID"""
        operators = (
            db.query(Operator)
            .options(
                joinedload(Operator.user),
                joinedload(Operator.branch)
            )
            .filter(Operator.BranchId == branch_id)
            .all()
        )
        
        result = []
        for operator in operators:
            branch_info = None
            if operator.branch:
                branch_info = self._transform_branch_info(operator.branch)
            
            result.append(OperatorResponse(
                userId=operator.UserId,
                branchId=operator.BranchId,
                user=self._transform_user(operator.user),
                branch=branch_info.dict() if branch_info else None
            ))
        
        return result

    def get_operator_by_user_id(self, db: Session, user_id: str) -> List[OperatorResponse]:
        """Get operator assignments by user ID"""
        operators = (
            db.query(Operator)
            .options(
                joinedload(Operator.user),
                joinedload(Operator.branch)
            )
            .filter(Operator.UserId == user_id)
            .all()
        )
        
        result = []
        for operator in operators:
            branch_info = None
            if operator.branch:
                branch_info = self._transform_branch_info(operator.branch)
            
            result.append(OperatorResponse(
                userId=operator.UserId,
                branchId=operator.BranchId,
                user=self._transform_user(operator.user),
                branch=branch_info.dict() if branch_info else None
            ))
        
        return result

    def create_operator(self, db: Session, operator_data: OperatorCreate) -> OperatorResponse:
        """Create a new operator assignment"""
        # Verify user exists and is not already an operator for this branch
        existing_operator = (
            db.query(Operator)
            .filter(Operator.UserId == operator_data.userId, Operator.BranchId == operator_data.branchId)
            .first()
        )
        if existing_operator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already an operator for this branch"
            )
        
        # Verify user exists
        user = db.query(User).filter(User.UserId == operator_data.userId).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        # Verify branch exists
        branch = db.query(Branch).filter(Branch.BranchId == operator_data.branchId).first()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch not found"
            )
        
        db_operator = Operator(
            UserId=operator_data.userId,
            BranchId=operator_data.branchId
        )
        db.add(db_operator)
        db.commit()
        db.refresh(db_operator)
        
        # Return with user and branch info
        return OperatorResponse(
            userId=db_operator.UserId,
            branchId=db_operator.BranchId,
            user=self._transform_user(user),
            branch=self._transform_branch_info(branch).dict()
        )

    def update_operator(self, db: Session, user_id: str, branch_id: str, operator_data: OperatorUpdate) -> Optional[OperatorResponse]:
        """Update operator assignment"""
        db_operator = (
            db.query(Operator)
            .filter(Operator.UserId == user_id, Operator.BranchId == branch_id)
            .first()
        )
        if not db_operator:
            return None
        
        update_data = operator_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "branchId":
                # Verify new branch exists
                new_branch = db.query(Branch).filter(Branch.BranchId == value).first()
                if not new_branch:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="New branch not found"
                    )
                setattr(db_operator, "BranchId", value)
        
        db.commit()
        db.refresh(db_operator)
        
        # Return with updated info
        user = db.query(User).filter(User.UserId == user_id).first()
        branch = db.query(Branch).filter(Branch.BranchId == db_operator.BranchId).first()
        
        return OperatorResponse(
            userId=db_operator.UserId,
            branchId=db_operator.BranchId,
            user=self._transform_user(user),
            branch=self._transform_branch_info(branch).dict()
        )

    def delete_operator(self, db: Session, user_id: str, branch_id: str) -> bool:
        """Delete operator assignment"""
        db_operator = (
            db.query(Operator)
            .filter(Operator.UserId == user_id, Operator.BranchId == branch_id)
            .first()
        )
        if not db_operator:
            return False
        
        db.delete(db_operator)
        db.commit()
        return True

    # Visitor Methods
    def get_all_visitors(self, db: Session) -> List[VisitorResponse]:
        """Get all visitors with user info"""
        visitors = (
            db.query(Visitor)
            .options(joinedload(Visitor.user))
            .all()
        )
        
        result = []
        for visitor in visitors:
            result.append(VisitorResponse(
                userId=visitor.UserId,
                user=self._transform_user(visitor.user)
            ))
        
        return result

    def get_visitor_by_id(self, db: Session, user_id: str) -> Optional[VisitorResponse]:
        """Get visitor by user ID"""
        visitor = (
            db.query(Visitor)
            .options(joinedload(Visitor.user))
            .filter(Visitor.UserId == user_id)
            .first()
        )
        
        if visitor:
            return VisitorResponse(
                userId=visitor.UserId,
                user=self._transform_user(visitor.user)
            )
        return None

    def create_visitor(self, db: Session, visitor_data: VisitorCreate) -> VisitorResponse:
        """Create a new visitor"""
        # Verify user exists
        user = db.query(User).filter(User.UserId == visitor_data.userId).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        # Check if visitor already exists
        existing_visitor = db.query(Visitor).filter(Visitor.UserId == visitor_data.userId).first()
        if existing_visitor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visitor already exists for this user"
            )
        
        db_visitor = Visitor(UserId=visitor_data.userId)
        db.add(db_visitor)
        db.commit()
        db.refresh(db_visitor)
        
        return VisitorResponse(
            userId=db_visitor.UserId,
            user=self._transform_user(user)
        )

    # Favorite Institution Methods
    def get_favorites_by_visitor_id(self, db: Session, visitor_id: str) -> List[FavoriteInstitutionResponse]:
        """Get favorites by visitor ID"""
        favorites = (
            db.query(FavoriteInstitution)
            .options(joinedload(FavoriteInstitution.branch))
            .filter(FavoriteInstitution.VisitorId == visitor_id)
            .all()
        )
        
        result = []
        for favorite in favorites:
            branch_info = None
            if favorite.branch:
                branch_info = self._transform_branch_info(favorite.branch)
            
            result.append(FavoriteInstitutionResponse(
                favoriteInstitutionId=favorite.FavoriteInstitutionId,
                visitorId=favorite.VisitorId,
                branchId=favorite.BranchId,
                createdAt=favorite.CreatedAt,
                branch=branch_info.dict() if branch_info else None
            ))
        
        return result

    def create_favorite(self, db: Session, favorite_data: FavoriteInstitutionCreate) -> FavoriteInstitutionResponse:
        """Create a new favorite"""
        # Verify visitor exists
        visitor = db.query(Visitor).filter(Visitor.UserId == favorite_data.visitorId).first()
        if not visitor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visitor not found"
            )
        
        # Verify branch exists
        branch = db.query(Branch).filter(Branch.BranchId == favorite_data.branchId).first()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch not found"
            )
        
        # Check if already favorited
        existing_favorite = (
            db.query(FavoriteInstitution)
            .filter(
                FavoriteInstitution.VisitorId == favorite_data.visitorId,
                FavoriteInstitution.BranchId == favorite_data.branchId
            )
            .first()
        )
        if existing_favorite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch is already favorited by this visitor"
            )
        
        favorite_id = str(uuid.uuid4())
        db_favorite = FavoriteInstitution(
            FavoriteInstitutionId=favorite_id,
            VisitorId=favorite_data.visitorId,
            BranchId=favorite_data.branchId,
            CreatedAt=datetime.now()
        )
        db.add(db_favorite)
        db.commit()
        db.refresh(db_favorite)
        
        return FavoriteInstitutionResponse(
            favoriteInstitutionId=db_favorite.FavoriteInstitutionId,
            visitorId=db_favorite.VisitorId,
            branchId=db_favorite.BranchId,
            createdAt=db_favorite.CreatedAt,
            branch=self._transform_branch_info(branch).dict()
        )

    def delete_favorite(self, db: Session, visitor_id: str, branch_id: str) -> bool:
        """Delete favorite"""
        db_favorite = (
            db.query(FavoriteInstitution)
            .filter(
                FavoriteInstitution.VisitorId == visitor_id,
                FavoriteInstitution.BranchId == branch_id
            )
            .first()
        )
        if not db_favorite:
            return False
        
        db.delete(db_favorite)
        db.commit()
        return True

    # Alert Preference Methods
    def get_alert_preferences_by_visitor_id(self, db: Session, visitor_id: str) -> List[AlertPreferenceResponse]:
        """Get alert preferences by visitor ID"""
        preferences = (
            db.query(AlertPreference)
            .options(joinedload(AlertPreference.branch))
            .filter(AlertPreference.VisitorId == visitor_id)
            .all()
        )
        
        result = []
        for preference in preferences:
            branch_info = None
            if preference.branch:
                branch_info = self._transform_branch_info(preference.branch)
            
            result.append(AlertPreferenceResponse(
                alertId=preference.AlertId,
                visitorId=preference.VisitorId,
                branchId=preference.BranchId,
                crowdThreshold=preference.CrowdThreshold,
                createdAt=preference.CreatedAt,
                branch=branch_info.dict() if branch_info else None
            ))
        
        return result

    def create_alert_preference(self, db: Session, preference_data: AlertPreferenceCreate) -> AlertPreferenceResponse:
        """Create a new alert preference"""
        # Verify visitor exists
        visitor = db.query(Visitor).filter(Visitor.UserId == preference_data.visitorId).first()
        if not visitor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visitor not found"
            )
        
        # Verify branch exists
        branch = db.query(Branch).filter(Branch.BranchId == preference_data.branchId).first()
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch not found"
            )
        
        # Check if preference already exists
        existing_preference = (
            db.query(AlertPreference)
            .filter(
                AlertPreference.VisitorId == preference_data.visitorId,
                AlertPreference.BranchId == preference_data.branchId
            )
            .first()
        )
        if existing_preference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alert preference already exists for this visitor and branch"
            )
        
        alert_id = str(uuid.uuid4())
        db_preference = AlertPreference(
            AlertId=alert_id,
            VisitorId=preference_data.visitorId,
            BranchId=preference_data.branchId,
            CrowdThreshold=preference_data.crowdThreshold,
            CreatedAt=datetime.now()
        )
        db.add(db_preference)
        db.commit()
        db.refresh(db_preference)
        
        return AlertPreferenceResponse(
            alertId=db_preference.AlertId,
            visitorId=db_preference.VisitorId,
            branchId=db_preference.BranchId,
            crowdThreshold=db_preference.CrowdThreshold,
            createdAt=db_preference.CreatedAt,
            branch=self._transform_branch_info(branch).dict()
        )

    def update_alert_preference(self, db: Session, alert_id: str, preference_data: AlertPreferenceUpdate) -> Optional[AlertPreferenceResponse]:
        """Update alert preference"""
        db_preference = db.query(AlertPreference).filter(AlertPreference.AlertId == alert_id).first()
        if not db_preference:
            return None
        
        update_data = preference_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field == "branchId":
                # Verify new branch exists
                new_branch = db.query(Branch).filter(Branch.BranchId == value).first()
                if not new_branch:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="New branch not found"
                    )
                setattr(db_preference, "BranchId", value)
            elif field == "crowdThreshold":
                setattr(db_preference, "CrowdThreshold", value)
        
        db.commit()
        db.refresh(db_preference)
        
        # Return with updated info
        branch = db.query(Branch).filter(Branch.BranchId == db_preference.BranchId).first()
        
        return AlertPreferenceResponse(
            alertId=db_preference.AlertId,
            visitorId=db_preference.VisitorId,
            branchId=db_preference.BranchId,
            crowdThreshold=db_preference.CrowdThreshold,
            createdAt=db_preference.CreatedAt,
            branch=self._transform_branch_info(branch).dict()
        )

    def delete_alert_preference(self, db: Session, alert_id: str) -> bool:
        """Delete alert preference"""
        db_preference = db.query(AlertPreference).filter(AlertPreference.AlertId == alert_id).first()
        if not db_preference:
            return False
        
        db.delete(db_preference)
        db.commit()
        return True

    # Administrator Methods
    def get_all_administrators(self, db: Session) -> List[AdministratorResponse]:
        """Get all administrators with user info"""
        administrators = (
            db.query(Administrator)
            .options(joinedload(Administrator.user))
            .all()
        )
        
        result = []
        for admin in administrators:
            result.append(AdministratorResponse(
                userId=admin.UserId,
                user=self._transform_user(admin.user)
            ))
        
        return result

    def create_administrator(self, db: Session, admin_data: AdministratorCreate) -> AdministratorResponse:
        """Create a new administrator"""
        # Verify user exists
        user = db.query(User).filter(User.UserId == admin_data.userId).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        # Check if administrator already exists
        existing_admin = db.query(Administrator).filter(Administrator.UserId == admin_data.userId).first()
        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrator already exists for this user"
            )
        
        db_admin = Administrator(UserId=admin_data.userId)
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        
        return AdministratorResponse(
            userId=db_admin.UserId,
            user=self._transform_user(user)
        )


user_service = UserService()
