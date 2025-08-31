from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
import uuid

from app.db.session import get_db
from app.schemas.crowd_data_schema import (
    CrowdDataCreate,
    CrowdDataUpdate,
    CrowdDataResponse,
    CrowdDataWithBranchResponse,
)
from app.services.crowd_data_service import crowd_data_service

crowd_data_router = APIRouter()


@crowd_data_router.post(
    "/crowd-data",
    response_model=CrowdDataResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["crowd-data"],
)
def create_crowd_data(crowd_data: CrowdDataCreate, db: Session = Depends(get_db)):
    """Create a new crowd data entry"""
    try:
        # Generate a unique ID for the crowd data
        crowd_data_id = str(uuid.uuid4())

        # Create the crowd data
        created_crowd_data = crowd_data_service.create_crowd_data(
            db=db, crowd_data=crowd_data, crowd_data_id=crowd_data_id
        )

        # Transform to response format
        response_data = CrowdDataResponse(
            crowdDataId=created_crowd_data.CrowdDataId,
            branchId=created_crowd_data.BranchId,
            timestamp=created_crowd_data.Timestamp,
            currentCrowdCount=created_crowd_data.CurrentCrowdCount,
        )

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_201_CREATED,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.get(
    "/crowd-data/{crowd_data_id}",
    response_model=CrowdDataWithBranchResponse,
    tags=["crowd-data"],
)
def get_crowd_data(crowd_data_id: str, db: Session = Depends(get_db)):
    """Get a specific crowd data entry by ID"""
    try:
        crowd_data = crowd_data_service.get_crowd_data(
            db=db, crowd_data_id=crowd_data_id
        )

        # Transform to response format with branch information
        response_data = CrowdDataWithBranchResponse(
            crowdDataId=crowd_data.CrowdDataId,
            branchId=crowd_data.BranchId,
            timestamp=crowd_data.Timestamp,
            currentCrowdCount=crowd_data.CurrentCrowdCount,
            branch=(
                {
                    "branchId": crowd_data.branch.BranchId,
                    "name": crowd_data.branch.Name,
                    "address": crowd_data.branch.Address,
                    "serviceHours": crowd_data.branch.ServiceHours,
                    "serviceDescription": crowd_data.branch.ServiceDescription,
                    "latitude": crowd_data.branch.Latitude,
                    "longitude": crowd_data.branch.Longitude,
                }
                if crowd_data.branch
                else None
            ),
        )

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.get(
    "/crowd-data", response_model=List[CrowdDataWithBranchResponse], tags=["crowd-data"]
)
def get_all_crowd_data(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get all crowd data entries with pagination"""
    try:
        crowd_data_list = crowd_data_service.get_all_crowd_data(
            db=db, skip=skip, limit=limit
        )

        # Transform to response format
        response_data = []
        for crowd_data in crowd_data_list:
            response_item = CrowdDataWithBranchResponse(
                crowdDataId=crowd_data.CrowdDataId,
                branchId=crowd_data.BranchId,
                timestamp=crowd_data.Timestamp,
                currentCrowdCount=crowd_data.CurrentCrowdCount,
                branch=(
                    {
                        "branchId": crowd_data.branch.BranchId,
                        "name": crowd_data.branch.Name,
                        "address": crowd_data.branch.Address,
                        "serviceHours": crowd_data.branch.ServiceHours,
                        "serviceDescription": crowd_data.branch.ServiceDescription,
                        "latitude": crowd_data.branch.Latitude,
                        "longitude": crowd_data.branch.Longitude,
                    }
                    if crowd_data.branch
                    else None
                ),
            )
            response_data.append(response_item)

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.get(
    "/crowd-data/branch/{branch_id}",
    response_model=List[CrowdDataWithBranchResponse],
    tags=["crowd-data"],
)
def get_crowd_data_by_branch(
    branch_id: str,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get crowd data for a specific branch"""
    try:
        crowd_data_list = crowd_data_service.get_crowd_data_by_branch(
            db=db, branch_id=branch_id, skip=skip, limit=limit
        )

        # Transform to response format
        response_data = []
        for crowd_data in crowd_data_list:
            response_item = CrowdDataWithBranchResponse(
                crowdDataId=crowd_data.CrowdDataId,
                branchId=crowd_data.BranchId,
                timestamp=crowd_data.Timestamp,
                currentCrowdCount=crowd_data.CurrentCrowdCount,
                branch=(
                    {
                        "branchId": crowd_data.branch.BranchId,
                        "name": crowd_data.branch.Name,
                        "address": crowd_data.branch.Address,
                        "serviceHours": crowd_data.branch.ServiceHours,
                        "serviceDescription": crowd_data.branch.ServiceDescription,
                        "latitude": crowd_data.branch.Latitude,
                        "longitude": crowd_data.branch.Longitude,
                    }
                    if crowd_data.branch
                    else None
                ),
            )
            response_data.append(response_item)

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.get(
    "/crowd-data/branch/{branch_id}/latest",
    response_model=CrowdDataWithBranchResponse,
    tags=["crowd-data"],
)
def get_latest_crowd_data_by_branch(branch_id: str, db: Session = Depends(get_db)):
    """Get the latest crowd data for a specific branch"""
    try:
        crowd_data = crowd_data_service.get_latest_crowd_data_by_branch(
            db=db, branch_id=branch_id
        )

        if not crowd_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No crowd data found for this branch",
            )

        # Transform to response format
        response_data = CrowdDataWithBranchResponse(
            crowdDataId=crowd_data.CrowdDataId,
            branchId=crowd_data.BranchId,
            timestamp=crowd_data.Timestamp,
            currentCrowdCount=crowd_data.CurrentCrowdCount,
            branch=(
                {
                    "branchId": crowd_data.branch.BranchId,
                    "name": crowd_data.branch.Name,
                    "address": crowd_data.branch.Address,
                    "serviceHours": crowd_data.branch.ServiceHours,
                    "serviceDescription": crowd_data.branch.ServiceDescription,
                    "latitude": crowd_data.branch.Latitude,
                    "longitude": crowd_data.branch.Longitude,
                }
                if crowd_data.branch
                else None
            ),
        )

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.get(
    "/crowd-data/branch/{branch_id}/date-range",
    response_model=List[CrowdDataWithBranchResponse],
    tags=["crowd-data"],
)
def get_crowd_data_by_date_range(
    branch_id: str,
    start_date: datetime = Query(..., description="Start date (ISO format)"),
    end_date: datetime = Query(..., description="End date (ISO format)"),
    db: Session = Depends(get_db),
):
    """Get crowd data for a specific branch within a date range"""
    try:
        crowd_data_list = crowd_data_service.get_crowd_data_by_date_range(
            db=db, branch_id=branch_id, start_date=start_date, end_date=end_date
        )

        # Transform to response format
        response_data = []
        for crowd_data in crowd_data_list:
            response_item = CrowdDataWithBranchResponse(
                crowdDataId=crowd_data.CrowdDataId,
                branchId=crowd_data.BranchId,
                timestamp=crowd_data.Timestamp,
                currentCrowdCount=crowd_data.CurrentCrowdCount,
                branch=(
                    {
                        "branchId": crowd_data.branch.BranchId,
                        "name": crowd_data.branch.Name,
                        "address": crowd_data.branch.Address,
                        "serviceHours": crowd_data.branch.ServiceHours,
                        "serviceDescription": crowd_data.branch.ServiceDescription,
                        "latitude": crowd_data.branch.Latitude,
                        "longitude": crowd_data.branch.Longitude,
                    }
                    if crowd_data.branch
                    else None
                ),
            )
            response_data.append(response_item)

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.put(
    "/crowd-data/{crowd_data_id}", response_model=CrowdDataResponse, tags=["crowd-data"]
)
def update_crowd_data(
    crowd_data_id: str,
    crowd_data_update: CrowdDataUpdate,
    db: Session = Depends(get_db),
):
    """Update a crowd data entry"""
    try:
        updated_crowd_data = crowd_data_service.update_crowd_data(
            db=db, crowd_data_id=crowd_data_id, crowd_data_update=crowd_data_update
        )

        # Transform to response format
        response_data = CrowdDataResponse(
            crowdDataId=updated_crowd_data.CrowdDataId,
            branchId=updated_crowd_data.BranchId,
            timestamp=updated_crowd_data.Timestamp,
            currentCrowdCount=updated_crowd_data.CurrentCrowdCount,
        )

        return JSONResponse(
            content=jsonable_encoder(response_data),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@crowd_data_router.delete(
    "/crowd-data/{crowd_data_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["crowd-data"],
)
def delete_crowd_data(crowd_data_id: str, db: Session = Depends(get_db)):
    """Delete a crowd data entry"""
    try:
        crowd_data_service.delete_crowd_data(db=db, crowd_data_id=crowd_data_id)
        return JSONResponse(
            content=None,
            status_code=status.HTTP_204_NO_CONTENT,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
