from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException, status

from app.models import Branch
from app.db.session import get_db
from sqlalchemy.orm import Session
from typing import List

from app.schemas.institution_schema import (
    InstitutionResponse,
    BranchResponse,
    InstitutionTypeResponse,
    AdministratorResponse,
)
from app.services.institution_service import institution_service

institution_router = APIRouter()


@institution_router.get(
    "/institutions/all", response_model=List[InstitutionResponse], tags=["user"]
)
def get_institutions(db: Session = Depends(get_db)):
    try:
        institutions = institution_service.get_all_institutions(db=db)
        if institutions:
            # Transform the data to match our schema
            response_data = []
            for institution in institutions:
                # Transform branches
                branches = [
                    BranchResponse(
                        name=branch.Name,
                        branchId=branch.BranchId,
                        address=branch.Address,
                        serviceHours=branch.ServiceHours,
                        serviceDescription=branch.ServiceDescription,
                        latitude=branch.Latitude,
                        longitude=branch.Longitude,
                        totalCrowdCount=getattr(branch, "total_crowd_count", 0),
                    )
                    for branch in institution.branches
                ]

                # Transform institution type
                institution_type = InstitutionTypeResponse(
                    institutionTypeId=institution.institution_type.InstitutionTypeId,
                    institutionType=institution.institution_type.InstitutionType,
                )

                # Transform administrator
                administrator = AdministratorResponse(
                    userId=institution.administrator.user.UserId,
                    name=institution.administrator.user.Name,
                    email=institution.administrator.user.Email,
                )

                # Create institution response
                institution_response = InstitutionResponse(
                    name=institution.Name,
                    institutionId=institution.InstitutionId,
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
            print("No institutions found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Institutions not found"
            )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
