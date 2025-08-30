from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.wait_time_prediction_schema import (
    WaitTimePredictionUpdate,
    WaitTimePredictionResponse,
    WaitTimePredictionRequest,
)
from app.services.wait_time_prediction_service import wait_time_prediction_service

wait_time_prediction_router = APIRouter()


@wait_time_prediction_router.post(
    "/wait-time-predictions",
    response_model=WaitTimePredictionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["wait-time-predictions"],
)
def create_wait_time_prediction(
    prediction_request: WaitTimePredictionRequest, db: Session = Depends(get_db)
):
    """Create a new wait time prediction using OpenAI"""
    try:
        # Create the wait time prediction
        created_prediction = wait_time_prediction_service.create_wait_time_prediction(
            db=db, prediction_request=prediction_request
        )

        return JSONResponse(
            content=jsonable_encoder(created_prediction),
            status_code=status.HTTP_201_CREATED,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.get(
    "/wait-time-predictions/{wait_time_prediction_id}",
    response_model=WaitTimePredictionResponse,
    tags=["wait-time-predictions"],
)
def get_wait_time_prediction(
    wait_time_prediction_id: str, db: Session = Depends(get_db)
):
    """Get a specific wait time prediction entry by ID"""
    try:
        prediction = wait_time_prediction_service.get_wait_time_prediction(
            db=db, wait_time_prediction_id=wait_time_prediction_id
        )

        return JSONResponse(
            content=jsonable_encoder(prediction),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.get(
    "/wait-time-predictions",
    response_model=List[WaitTimePredictionResponse],
    tags=["wait-time-predictions"],
)
def get_all_wait_time_predictions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get all wait time prediction entries with pagination"""
    try:
        predictions = wait_time_prediction_service.get_all_wait_time_predictions(
            db=db, skip=skip, limit=limit
        )

        return JSONResponse(
            content=jsonable_encoder(predictions),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.get(
    "/wait-time-predictions/visitor/{visitor_id}",
    response_model=List[WaitTimePredictionResponse],
    tags=["wait-time-predictions"],
)
def get_wait_time_predictions_by_visitor(
    visitor_id: str,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get wait time predictions for a specific visitor"""
    try:
        predictions = wait_time_prediction_service.get_wait_time_predictions_by_visitor(
            db=db, visitor_id=visitor_id, skip=skip, limit=limit
        )

        return JSONResponse(
            content=jsonable_encoder(predictions),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.get(
    "/wait-time-predictions/branch/{branch_id}",
    response_model=List[WaitTimePredictionResponse],
    tags=["wait-time-predictions"],
)
def get_wait_time_predictions_by_branch(
    branch_id: str,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    db: Session = Depends(get_db),
):
    """Get wait time predictions for a specific branch"""
    try:
        predictions = wait_time_prediction_service.get_wait_time_predictions_by_branch(
            db=db, branch_id=branch_id, skip=skip, limit=limit
        )

        return JSONResponse(
            content=jsonable_encoder(predictions),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.put(
    "/wait-time-predictions/{wait_time_prediction_id}",
    response_model=WaitTimePredictionResponse,
    tags=["wait-time-predictions"],
)
def update_wait_time_prediction(
    wait_time_prediction_id: str,
    prediction_update: WaitTimePredictionUpdate,
    db: Session = Depends(get_db),
):
    """Update a wait time prediction entry"""
    try:
        updated_prediction = wait_time_prediction_service.update_wait_time_prediction(
            db=db, 
            wait_time_prediction_id=wait_time_prediction_id, 
            wait_time_prediction_update=prediction_update
        )

        return JSONResponse(
            content=jsonable_encoder(updated_prediction),
            status_code=status.HTTP_200_OK,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@wait_time_prediction_router.delete(
    "/wait-time-predictions/{wait_time_prediction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["wait-time-predictions"],
)
def delete_wait_time_prediction(
    wait_time_prediction_id: str, db: Session = Depends(get_db)
):
    """Delete a wait time prediction entry"""
    try:
        wait_time_prediction_service.delete_wait_time_prediction(
            db=db, wait_time_prediction_id=wait_time_prediction_id
        )

        return JSONResponse(
            content={"message": "Wait time prediction deleted successfully"},
            status_code=status.HTTP_204_NO_CONTENT,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
