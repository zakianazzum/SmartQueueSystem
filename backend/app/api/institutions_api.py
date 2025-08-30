from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException, status

from app.models import Branch
from app.db.session import get_db
from sqlalchemy.orm import Session

from app.schemas.institution_schema import (
    InstitutionResponse,
)
from app.services.institution_service import institution_service

institution_router = APIRouter()


@institution_router.get(
    "/institutions/all", response_model=InstitutionResponse, tags=["user"]
)
def get_institutions(db: Session = Depends(get_db)):
    try:
        print("Fetching all institutions")
        institutions = institution_service.get_all_institutions(db=db)
        print("Institutions fetched successfully")
        if institutions:
            return JSONResponse(
                content=jsonable_encoder(institutions),
                status_code=status.HTTP_200_OK,
            )
        else:
            print("No institutions found")
            raise HTTPException(
                status_code=status.HTT_404_NOT_FOUND, detail="Institutions not found"
            )
    except HTTPException:
        raise Exception("HTTP error occurred")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
