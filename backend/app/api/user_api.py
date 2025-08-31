from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.db.session import get_db
from sqlalchemy.orm import Session

from app.schemas.user_schema import (
    UserResponse,
    UserCreate,
    UserUpdate,
    OperatorResponse,
    OperatorCreate,
    OperatorUpdate,
    VisitorResponse,
    VisitorCreate,
    FavoriteInstitutionResponse,
    FavoriteInstitutionCreate,
    FavoriteInstitutionUpdate,
    AlertPreferenceResponse,
    AlertPreferenceCreate,
    AlertPreferenceUpdate,
    AdministratorResponse,
    AdministratorCreate,
)
from app.services.user_service import user_service

user_router = APIRouter()


# User APIs
@user_router.get(
    "/users", response_model=List[UserResponse], tags=["user"]
)
def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    try:
        users = user_service.get_all_users(db=db)
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.get(
    "/users/{user_id}", response_model=UserResponse, tags=["user"]
)
def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID"""
    try:
        user = user_service.get_user_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/users", response_model=UserResponse, tags=["user"]
)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        user = user_service.create_user(db=db, user_data=user_data)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.put(
    "/users/{user_id}", response_model=UserResponse, tags=["user"]
)
def update_user(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user"""
    try:
        user = user_service.update_user(db=db, user_id=user_id, user_data=user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.delete(
    "/users/{user_id}", tags=["user"]
)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """Delete user"""
    try:
        success = user_service.delete_user(db=db, user_id=user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Operator APIs
@user_router.get(
    "/operators", response_model=List[OperatorResponse], tags=["operator"]
)
def get_all_operators(db: Session = Depends(get_db)):
    """Get all operators"""
    try:
        operators = user_service.get_all_operators(db=db)
        return operators
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.get(
    "/branches/{branch_id}/operators", response_model=List[OperatorResponse], tags=["operator"]
)
def get_operators_by_branch_id(branch_id: str, db: Session = Depends(get_db)):
    """Get operators by branch ID"""
    try:
        operators = user_service.get_operators_by_branch_id(db=db, branch_id=branch_id)
        return operators
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.get(
    "/users/{user_id}/operator-assignments", response_model=List[OperatorResponse], tags=["operator"]
)
def get_operator_assignments_by_user_id(user_id: str, db: Session = Depends(get_db)):
    """Get operator assignments by user ID"""
    try:
        operators = user_service.get_operator_by_user_id(db=db, user_id=user_id)
        return operators
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/operators", response_model=OperatorResponse, tags=["operator"]
)
def create_operator(operator_data: OperatorCreate, db: Session = Depends(get_db)):
    """Create a new operator assignment"""
    try:
        operator = user_service.create_operator(db=db, operator_data=operator_data)
        return operator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.put(
    "/operators/{user_id}/{branch_id}", response_model=OperatorResponse, tags=["operator"]
)
def update_operator(user_id: str, branch_id: str, operator_data: OperatorUpdate, db: Session = Depends(get_db)):
    """Update operator assignment"""
    try:
        operator = user_service.update_operator(db=db, user_id=user_id, branch_id=branch_id, operator_data=operator_data)
        if not operator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator assignment not found"
            )
        return operator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.delete(
    "/operators/{user_id}/{branch_id}", tags=["operator"]
)
def delete_operator(user_id: str, branch_id: str, db: Session = Depends(get_db)):
    """Delete operator assignment"""
    try:
        success = user_service.delete_operator(db=db, user_id=user_id, branch_id=branch_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Operator assignment not found"
            )
        return {"message": "Operator assignment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Visitor APIs
@user_router.get(
    "/visitors", response_model=List[VisitorResponse], tags=["visitor"]
)
def get_all_visitors(db: Session = Depends(get_db)):
    """Get all visitors"""
    try:
        visitors = user_service.get_all_visitors(db=db)
        return visitors
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.get(
    "/visitors/{user_id}", response_model=VisitorResponse, tags=["visitor"]
)
def get_visitor_by_id(user_id: str, db: Session = Depends(get_db)):
    """Get visitor by user ID"""
    try:
        visitor = user_service.get_visitor_by_id(db=db, user_id=user_id)
        if not visitor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visitor not found"
            )
        return visitor
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/visitors", response_model=VisitorResponse, tags=["visitor"]
)
def create_visitor(visitor_data: VisitorCreate, db: Session = Depends(get_db)):
    """Create a new visitor"""
    try:
        visitor = user_service.create_visitor(db=db, visitor_data=visitor_data)
        return visitor
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Favorite Institution APIs
@user_router.get(
    "/visitors/{visitor_id}/favorites", response_model=List[FavoriteInstitutionResponse], tags=["favorites"]
)
def get_favorites_by_visitor_id(visitor_id: str, db: Session = Depends(get_db)):
    """Get favorites by visitor ID"""
    try:
        favorites = user_service.get_favorites_by_visitor_id(db=db, visitor_id=visitor_id)
        return favorites
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/favorites", response_model=FavoriteInstitutionResponse, tags=["favorites"]
)
def create_favorite(favorite_data: FavoriteInstitutionCreate, db: Session = Depends(get_db)):
    """Create a new favorite"""
    try:
        favorite = user_service.create_favorite(db=db, favorite_data=favorite_data)
        return favorite
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.delete(
    "/favorites/{visitor_id}/{branch_id}", tags=["favorites"]
)
def delete_favorite(visitor_id: str, branch_id: str, db: Session = Depends(get_db)):
    """Delete favorite"""
    try:
        success = user_service.delete_favorite(db=db, visitor_id=visitor_id, branch_id=branch_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found"
            )
        return {"message": "Favorite deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Alert Preference APIs
@user_router.get(
    "/visitors/{visitor_id}/alert-preferences", response_model=List[AlertPreferenceResponse], tags=["alerts"]
)
def get_alert_preferences_by_visitor_id(visitor_id: str, db: Session = Depends(get_db)):
    """Get alert preferences by visitor ID"""
    try:
        preferences = user_service.get_alert_preferences_by_visitor_id(db=db, visitor_id=visitor_id)
        return preferences
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/alert-preferences", response_model=AlertPreferenceResponse, tags=["alerts"]
)
def create_alert_preference(preference_data: AlertPreferenceCreate, db: Session = Depends(get_db)):
    """Create a new alert preference"""
    try:
        preference = user_service.create_alert_preference(db=db, preference_data=preference_data)
        return preference
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.put(
    "/alert-preferences/{alert_id}", response_model=AlertPreferenceResponse, tags=["alerts"]
)
def update_alert_preference(alert_id: str, preference_data: AlertPreferenceUpdate, db: Session = Depends(get_db)):
    """Update alert preference"""
    try:
        preference = user_service.update_alert_preference(db=db, alert_id=alert_id, preference_data=preference_data)
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert preference not found"
            )
        return preference
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.delete(
    "/alert-preferences/{alert_id}", tags=["alerts"]
)
def delete_alert_preference(alert_id: str, db: Session = Depends(get_db)):
    """Delete alert preference"""
    try:
        success = user_service.delete_alert_preference(db=db, alert_id=alert_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert preference not found"
            )
        return {"message": "Alert preference deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Administrator APIs
@user_router.get(
    "/administrators", response_model=List[AdministratorResponse], tags=["administrator"]
)
def get_all_administrators(db: Session = Depends(get_db)):
    """Get all administrators"""
    try:
        administrators = user_service.get_all_administrators(db=db)
        return administrators
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@user_router.post(
    "/administrators", response_model=AdministratorResponse, tags=["administrator"]
)
def create_administrator(admin_data: AdministratorCreate, db: Session = Depends(get_db)):
    """Create a new administrator"""
    try:
        administrator = user_service.create_administrator(db=db, admin_data=admin_data)
        return administrator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
