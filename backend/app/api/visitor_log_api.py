from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.visitor_log_schema import (
    VisitorLogCreate,
    VisitorLogUpdate,
    VisitorLogResponse,
)
from app.services.visitor_log_service import visitor_log_service

visitor_log_router = APIRouter()


@visitor_log_router.post(
    "/visitor-logs",
    response_model=VisitorLogResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["visitor-logs"],
)
def create_visitor_log(visitor_log: VisitorLogCreate, db: Session = Depends(get_db)):
    """Create a new visitor log entry"""
    try:
        # Create the visitor log (ID will be generated in the service)
        created_visitor_log = visitor_log_service.create_visitor_log(
            db=db, visitor_log=visitor_log
        )

        return JSONResponse(
            content=jsonable_encoder(created_visitor_log),
            status_code=status.HTTP_201_CREATED,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.get(
    "/visitor-logs/{visitor_log_id}",
    response_model=VisitorLogResponse,
    tags=["visitor-logs"],
)
def get_visitor_log(visitor_log_id: str, db: Session = Depends(get_db)):
    """Get a specific visitor log entry by ID"""
    try:
        visitor_log = visitor_log_service.get_visitor_log(
            db=db, visitor_log_id=visitor_log_id
        )

        return JSONResponse(
            content=jsonable_encoder(visitor_log),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.get(
    "/visitor-logs",
    response_model=List[VisitorLogResponse],
    tags=["visitor-logs"],
)
def get_all_visitor_logs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get all visitor log entries with pagination"""
    try:
        visitor_logs = visitor_log_service.get_all_visitor_logs(
            db=db, skip=skip, limit=limit
        )

        return JSONResponse(
            content=jsonable_encoder(visitor_logs),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.get(
    "/visitor-logs/branch/{branch_id}",
    response_model=List[VisitorLogResponse],
    tags=["visitor-logs"],
)
def get_visitor_logs_by_branch(
    branch_id: str,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get visitor logs for a specific branch"""
    try:
        visitor_logs = visitor_log_service.get_visitor_logs_by_branch(
            db=db, branch_id=branch_id, skip=skip, limit=limit
        )

        return JSONResponse(
            content=jsonable_encoder(visitor_logs),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.get(
    "/visitor-logs/branch/{branch_id}/last-30-days",
    response_model=List[VisitorLogResponse],
    tags=["visitor-logs"],
)
def get_visitor_logs_by_branch_last_30_days(
    branch_id: str, db: Session = Depends(get_db)
):
    """Get visitor logs for a specific branch in the last 30 days"""
    try:
        visitor_logs = visitor_log_service.get_visitor_logs_by_branch_last_30_days(
            db=db, branch_id=branch_id
        )

        return JSONResponse(
            content=jsonable_encoder(visitor_logs),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.get(
    "/visitor-logs/branch/{branch_id}/average-wait-time",
    tags=["visitor-logs"],
)
def get_average_wait_time_by_branch(branch_id: str, db: Session = Depends(get_db)):
    """Get average wait time for a specific branch"""
    try:
        average_wait_time = visitor_log_service.get_average_wait_time_by_branch(
            db=db, branch_id=branch_id
        )

        return JSONResponse(
            content={"branchId": branch_id, "averageWaitTime": average_wait_time},
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.put(
    "/visitor-logs/{visitor_log_id}",
    response_model=VisitorLogResponse,
    tags=["visitor-logs"],
)
def update_visitor_log(
    visitor_log_id: str,
    visitor_log_update: VisitorLogUpdate,
    db: Session = Depends(get_db),
):
    """Update a visitor log entry"""
    try:
        updated_visitor_log = visitor_log_service.update_visitor_log(
            db=db, visitor_log_id=visitor_log_id, visitor_log_update=visitor_log_update
        )

        return JSONResponse(
            content=jsonable_encoder(updated_visitor_log),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@visitor_log_router.delete(
    "/visitor-logs/{visitor_log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["visitor-logs"],
)
def delete_visitor_log(visitor_log_id: str, db: Session = Depends(get_db)):
    """Delete a visitor log entry"""
    try:
        visitor_log_service.delete_visitor_log(db=db, visitor_log_id=visitor_log_id)

        return JSONResponse(
            content={"message": "Visitor log deleted successfully"},
            status_code=status.HTTP_204_NO_CONTENT,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
