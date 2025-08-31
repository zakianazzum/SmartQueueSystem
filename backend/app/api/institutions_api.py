from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models import Branch
from app.db.session import get_db
from sqlalchemy.orm import Session

from app.schemas.institution_schema import (
    InstitutionResponse,
    InstitutionCreate,
    InstitutionUpdate,
    BranchResponse,
    BranchCreate,
    BranchUpdate,
    InstitutionTypeResponse,
    InstitutionTypeCreate,
    InstitutionTypeUpdate,
    AdministratorResponse,
    InstitutionResponseLegacy,
    BranchResponseLegacy,
)
from app.services.institution_service import institution_service

institution_router = APIRouter()


# Institution Type APIs
@institution_router.get(
    "/institution-types", response_model=List[InstitutionTypeResponse], tags=["institution"]
)
def get_all_institution_types(db: Session = Depends(get_db)):
    """Get all institution types"""
    try:
        institution_types = institution_service.get_all_institution_types(db=db)
        return institution_types
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.get(
    "/institution-types/{institution_type_id}", response_model=InstitutionTypeResponse, tags=["institution"]
)
def get_institution_type_by_id(institution_type_id: str, db: Session = Depends(get_db)):
    """Get institution type by ID"""
    try:
        institution_type = institution_service.get_institution_type_by_id(db=db, institution_type_id=institution_type_id)
        if not institution_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution type not found"
            )
        return institution_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.post(
    "/institution-types", response_model=InstitutionTypeResponse, tags=["institution"]
)
def create_institution_type(institution_type_data: InstitutionTypeCreate, db: Session = Depends(get_db)):
    """Create a new institution type"""
    try:
        institution_type = institution_service.create_institution_type(db=db, institution_type_data=institution_type_data)
        return institution_type
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.put(
    "/institution-types/{institution_type_id}", response_model=InstitutionTypeResponse, tags=["institution"]
)
def update_institution_type(institution_type_id: str, institution_type_data: InstitutionTypeUpdate, db: Session = Depends(get_db)):
    """Update institution type"""
    try:
        institution_type = institution_service.update_institution_type(db=db, institution_type_id=institution_type_id, institution_type_data=institution_type_data)
        if not institution_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution type not found"
            )
        return institution_type
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.delete(
    "/institution-types/{institution_type_id}", tags=["institution"]
)
def delete_institution_type(institution_type_id: str, db: Session = Depends(get_db)):
    """Delete institution type"""
    try:
        success = institution_service.delete_institution_type(db=db, institution_type_id=institution_type_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution type not found"
            )
        return {"message": "Institution type deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Institution APIs
@institution_router.get(
    "/institutions", response_model=List[InstitutionResponse], tags=["institution"]
)
def get_all_institutions(db: Session = Depends(get_db)):
    """Get all institutions"""
    try:
        institutions = institution_service.get_all_institutions(db=db)
        return institutions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.get(
    "/institutions/{institution_id}", response_model=InstitutionResponse, tags=["institution"]
)
def get_institution_by_id(institution_id: str, db: Session = Depends(get_db)):
    """Get institution by ID"""
    try:
        institution = institution_service.get_institution_by_id(db=db, institution_id=institution_id)
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )
        return institution
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.post(
    "/institutions", response_model=InstitutionResponse, tags=["institution"]
)
def create_institution(institution_data: InstitutionCreate, db: Session = Depends(get_db)):
    """Create a new institution"""
    try:
        institution = institution_service.create_institution(db=db, institution_data=institution_data)
        return institution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.put(
    "/institutions/{institution_id}", response_model=InstitutionResponse, tags=["institution"]
)
def update_institution(institution_id: str, institution_data: InstitutionUpdate, db: Session = Depends(get_db)):
    """Update institution"""
    try:
        institution = institution_service.update_institution(db=db, institution_id=institution_id, institution_data=institution_data)
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )
        return institution
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.delete(
    "/institutions/{institution_id}", tags=["institution"]
)
def delete_institution(institution_id: str, db: Session = Depends(get_db)):
    """Delete institution"""
    try:
        success = institution_service.delete_institution(db=db, institution_id=institution_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found"
            )
        return {"message": "Institution deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Branch APIs
@institution_router.get(
    "/branches", response_model=List[BranchResponse], tags=["institution"]
)
def get_all_branches(db: Session = Depends(get_db)):
    """Get all branches"""
    try:
        branches = institution_service.get_all_branches(db=db)
        return branches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.get(
    "/branches/{branch_id}", response_model=BranchResponse, tags=["institution"]
)
def get_branch_by_id(branch_id: str, db: Session = Depends(get_db)):
    """Get branch by ID"""
    try:
        branch = institution_service.get_branch_by_id(db=db, branch_id=branch_id)
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found"
            )
        return branch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.get(
    "/institutions/{institution_id}/branches", response_model=List[BranchResponse], tags=["institution"]
)
def get_branches_by_institution_id(institution_id: str, db: Session = Depends(get_db)):
    """Get branches by institution ID"""
    try:
        branches = institution_service.get_branches_by_institution_id(db=db, institution_id=institution_id)
        return branches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.post(
    "/branches", response_model=BranchResponse, tags=["institution"]
)
def create_branch(branch_data: BranchCreate, db: Session = Depends(get_db)):
    """Create a new branch"""
    try:
        branch = institution_service.create_branch(db=db, branch_data=branch_data)
        return branch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.put(
    "/branches/{branch_id}", response_model=BranchResponse, tags=["institution"]
)
def update_branch(branch_id: str, branch_data: BranchUpdate, db: Session = Depends(get_db)):
    """Update branch"""
    try:
        branch = institution_service.update_branch(db=db, branch_id=branch_id, branch_data=branch_data)
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found"
            )
        return branch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@institution_router.delete(
    "/branches/{branch_id}", tags=["institution"]
)
def delete_branch(branch_id: str, db: Session = Depends(get_db)):
    """Delete branch"""
    try:
        success = institution_service.delete_branch(db=db, branch_id=branch_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branch not found"
            )
        return {"message": "Branch deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Legacy endpoint for backward compatibility
@institution_router.get(
    "/institutions/all", response_model=List[InstitutionResponseLegacy], tags=["user"]
)
def get_institutions_legacy(db: Session = Depends(get_db)):
    """Legacy endpoint to get all institutions with old response format"""
    try:
        institutions = institution_service.get_all_institutions(db=db)
        if institutions:
            # Transform the data to match our legacy schema
            response_data = []
            for institution in institutions:
                # Transform branches
                branches = [
                    BranchResponseLegacy(
                        name=branch.name,
                        branchId=branch.branchId,
                        address=branch.address,
                        serviceHours=branch.serviceHours,
                        serviceDescription=branch.serviceDescription,
                        latitude=branch.latitude,
                        longitude=branch.longitude,
                        totalCrowdCount=branch.totalCrowdCount,
                    )
                    for branch in institution.branches
                ]

                # Transform institution type
                institution_type = InstitutionTypeResponse(
                    institutionTypeId=institution.institutionType.institutionTypeId,
                    institutionType=institution.institutionType.institutionType,
                ) if institution.institutionType else None

                # Transform administrator
                administrator = AdministratorResponse(
                    userId=institution.administrator.userId,
                    name=institution.administrator.name,
                    email=institution.administrator.email,
                ) if institution.administrator else None

                # Create institution response
                institution_response = InstitutionResponseLegacy(
                    name=institution.name,
                    institutionId=institution.institutionId,
                    institutionType=institution_type,
                    administrator=administrator,
                    branches=branches,
                )
                response_data.append(institution_response)

            return JSONResponse(
                content=jsonable_encoder(response_data),
                status_code=status.HTTP_200_OK,
            )
        else:
            return JSONResponse(
                content=jsonable_encoder([]),
                status_code=status.HTTP_200_OK,
            )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
