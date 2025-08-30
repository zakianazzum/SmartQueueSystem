from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models import VisitorLog, Branch
from app.schemas.visitor_log_schema import VisitorLogCreate, VisitorLogUpdate


class VisitorLogCRUD:
    def create_visitor_log(
        self, db: Session, visitor_log: VisitorLogCreate, visitor_log_id: str
    ) -> VisitorLog:
        """Create a new visitor log entry"""
        try:
            db_visitor_log = VisitorLog(
                VisitorLogId=visitor_log_id,
                VisitorName=visitor_log.visitorName,
                BranchId=visitor_log.branchId,
                CheckInTime=visitor_log.checkInTime,
                ServiceStartTime=visitor_log.serviceStartTime,
                WaitTimeInMinutes=visitor_log.waitTimeInMinutes,
            )

            db.add(db_visitor_log)
            db.commit()
            db.refresh(db_visitor_log)
            return db_visitor_log
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create visitor log: {str(e)}",
            )

    def get_visitor_log(self, db: Session, visitor_log_id: str) -> Optional[VisitorLog]:
        """Get a single visitor log entry by ID"""
        visitor_log = (
            db.query(VisitorLog)
            .filter(VisitorLog.VisitorLogId == visitor_log_id)
            .first()
        )

        if not visitor_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Visitor log not found"
            )
        return visitor_log

    def get_all_visitor_logs(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[VisitorLog]:
        """Get all visitor log entries with pagination"""
        visitor_logs = (
            db.query(VisitorLog)
            .order_by(VisitorLog.CheckInTime.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return visitor_logs

    def get_visitor_logs_by_branch(
        self, db: Session, branch_id: str, skip: int = 0, limit: int = 100
    ) -> List[VisitorLog]:
        """Get visitor logs for a specific branch"""
        visitor_logs = (
            db.query(VisitorLog)
            .filter(VisitorLog.BranchId == branch_id)
            .order_by(VisitorLog.CheckInTime.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return visitor_logs

    def get_visitor_logs_by_branch_last_30_days(
        self, db: Session, branch_id: str
    ) -> List[VisitorLog]:
        """Get visitor logs for a specific branch in the last 30 days"""
        thirty_days_ago = datetime.now() - timedelta(days=30)
        visitor_logs = (
            db.query(VisitorLog)
            .filter(
                VisitorLog.BranchId == branch_id,
                VisitorLog.CheckInTime >= thirty_days_ago
            )
            .order_by(VisitorLog.CheckInTime.desc())
            .all()
        )
        return visitor_logs

    def get_average_wait_time_by_branch(
        self, db: Session, branch_id: str
    ) -> float:
        """Get average wait time for a specific branch"""
        result = (
            db.query(func.avg(VisitorLog.WaitTimeInMinutes))
            .filter(VisitorLog.BranchId == branch_id)
            .scalar()
        )
        return float(result) if result else 0.0

    def update_visitor_log(
        self, db: Session, visitor_log_id: str, visitor_log_update: VisitorLogUpdate
    ) -> VisitorLog:
        """Update a visitor log entry"""
        visitor_log = self.get_visitor_log(db, visitor_log_id)
        
        update_data = visitor_log_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            # Map camelCase to PascalCase for database fields
            if field == "visitorName":
                setattr(visitor_log, "VisitorName", value)
            elif field == "branchId":
                setattr(visitor_log, "BranchId", value)
            elif field == "checkInTime":
                setattr(visitor_log, "CheckInTime", value)
            elif field == "serviceStartTime":
                setattr(visitor_log, "ServiceStartTime", value)
            elif field == "waitTimeInMinutes":
                setattr(visitor_log, "WaitTimeInMinutes", value)

        db.add(visitor_log)
        db.commit()
        db.refresh(visitor_log)
        return visitor_log

    def delete_visitor_log(self, db: Session, visitor_log_id: str) -> bool:
        """Delete a visitor log entry"""
        visitor_log = self.get_visitor_log(db, visitor_log_id)
        
        db.delete(visitor_log)
        db.commit()
        return True


visitor_log_crud = VisitorLogCRUD()
