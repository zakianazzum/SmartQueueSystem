from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import WaitTimePrediction, Branch
from app.schemas.wait_time_prediction_schema import WaitTimePredictionCreate, WaitTimePredictionUpdate


class WaitTimePredictionCRUD:
    def create_wait_time_prediction(
        self, db: Session, wait_time_prediction: WaitTimePredictionCreate
    ) -> WaitTimePrediction:
        """Create a new wait time prediction entry"""
        try:
            db_wait_time_prediction = WaitTimePrediction(
                WaitTimePredictionId=wait_time_prediction.waitTimePredictionId,
                VisitorId=wait_time_prediction.visitorId,
                BranchId=wait_time_prediction.branchId,
                VisitDate=wait_time_prediction.visitDate,
                PredictedWaitTime=wait_time_prediction.predictedWaitTime,
                ActualWaitTime=wait_time_prediction.actualWaitTime,
                Accuracy=wait_time_prediction.accuracy,
                PredictedAt=wait_time_prediction.predictedAt,
            )

            db.add(db_wait_time_prediction)
            db.commit()
            db.refresh(db_wait_time_prediction)
            return db_wait_time_prediction
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create wait time prediction: {str(e)}",
            )

    def get_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str
    ) -> Optional[WaitTimePrediction]:
        """Get a single wait time prediction entry by ID"""
        wait_time_prediction = (
            db.query(WaitTimePrediction)
            .filter(WaitTimePrediction.WaitTimePredictionId == wait_time_prediction_id)
            .first()
        )

        if not wait_time_prediction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Wait time prediction not found"
            )
        return wait_time_prediction

    def get_all_wait_time_predictions(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePrediction]:
        """Get all wait time prediction entries with pagination"""
        wait_time_predictions = (
            db.query(WaitTimePrediction)
            .order_by(WaitTimePrediction.PredictedAt.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return wait_time_predictions

    def get_wait_time_predictions_by_visitor(
        self, db: Session, visitor_id: str, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePrediction]:
        """Get wait time predictions for a specific visitor"""
        wait_time_predictions = (
            db.query(WaitTimePrediction)
            .filter(WaitTimePrediction.VisitorId == visitor_id)
            .order_by(WaitTimePrediction.PredictedAt.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return wait_time_predictions

    def get_wait_time_predictions_by_branch(
        self, db: Session, branch_id: str, skip: int = 0, limit: int = 100
    ) -> List[WaitTimePrediction]:
        """Get wait time predictions for a specific branch"""
        wait_time_predictions = (
            db.query(WaitTimePrediction)
            .filter(WaitTimePrediction.BranchId == branch_id)
            .order_by(WaitTimePrediction.PredictedAt.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return wait_time_predictions

    def update_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str, 
        wait_time_prediction_update: WaitTimePredictionUpdate
    ) -> WaitTimePrediction:
        """Update a wait time prediction entry"""
        wait_time_prediction = self.get_wait_time_prediction(db, wait_time_prediction_id)
        
        update_data = wait_time_prediction_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            # Map camelCase to PascalCase for database fields
            if field == "visitorId":
                setattr(wait_time_prediction, "VisitorId", value)
            elif field == "branchId":
                setattr(wait_time_prediction, "BranchId", value)
            elif field == "visitDate":
                setattr(wait_time_prediction, "VisitDate", value)
            elif field == "predictedWaitTime":
                setattr(wait_time_prediction, "PredictedWaitTime", value)
            elif field == "actualWaitTime":
                setattr(wait_time_prediction, "ActualWaitTime", value)
            elif field == "accuracy":
                setattr(wait_time_prediction, "Accuracy", value)

        db.add(wait_time_prediction)
        db.commit()
        db.refresh(wait_time_prediction)
        return wait_time_prediction

    def delete_wait_time_prediction(
        self, db: Session, wait_time_prediction_id: str
    ) -> bool:
        """Delete a wait time prediction entry"""
        wait_time_prediction = self.get_wait_time_prediction(db, wait_time_prediction_id)
        
        db.delete(wait_time_prediction)
        db.commit()
        return True


wait_time_prediction_crud = WaitTimePredictionCRUD()
