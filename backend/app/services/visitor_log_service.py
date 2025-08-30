from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.visitor_log_crud import visitor_log_crud
from app.models import VisitorLog, Branch
from app.schemas.visitor_log_schema import VisitorLogCreate, VisitorLogUpdate, VisitorLogResponse


class VisitorLogService:
    def __init__(self):
        pass

    def create_visitor_log(
        self, db: Session, visitor_log: VisitorLogCreate
    ) -> VisitorLogResponse:
        """Create a new visitor log entry"""
        try:
            # Verify that the branch exists
            branch = db.query(Branch).filter(Branch.BranchId == visitor_log.branchId).first()
            if not branch:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Branch not found"
                )

            # Calculate wait time if not provided
            if visitor_log.waitTimeInMinutes is None:
                if visitor_log.serviceStartTime and visitor_log.checkInTime:
                    time_diff = visitor_log.serviceStartTime - visitor_log.checkInTime
                    visitor_log.waitTimeInMinutes = int(time_diff.total_seconds() / 60)

            # Generate a unique ID for the visitor log
            import uuid
            visitor_log_id = str(uuid.uuid4())
            
            db_visitor_log = visitor_log_crud.create_visitor_log(db, visitor_log, visitor_log_id)
            return VisitorLogResponse(
                visitorLogId=db_visitor_log.VisitorLogId,
                visitorName=db_visitor_log.VisitorName,
                branchId=db_visitor_log.BranchId,
                checkInTime=db_visitor_log.CheckInTime,
                serviceStartTime=db_visitor_log.ServiceStartTime,
                waitTimeInMinutes=db_visitor_log.WaitTimeInMinutes,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create visitor log: {str(e)}",
            )

    def get_visitor_log(self, db: Session, visitor_log_id: str) -> VisitorLogResponse:
        """Get a single visitor log entry by ID"""
        try:
            db_visitor_log = visitor_log_crud.get_visitor_log(db, visitor_log_id)
            return VisitorLogResponse(
                visitorLogId=db_visitor_log.VisitorLogId,
                visitorName=db_visitor_log.VisitorName,
                branchId=db_visitor_log.BranchId,
                checkInTime=db_visitor_log.CheckInTime,
                serviceStartTime=db_visitor_log.ServiceStartTime,
                waitTimeInMinutes=db_visitor_log.WaitTimeInMinutes,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get visitor log: {str(e)}",
            )

    def get_all_visitor_logs(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[VisitorLogResponse]:
        """Get all visitor log entries with pagination"""
        try:
            db_visitor_logs = visitor_log_crud.get_all_visitor_logs(db, skip, limit)
            return [
                VisitorLogResponse(
                    visitorLogId=log.VisitorLogId,
                    visitorName=log.VisitorName,
                    branchId=log.BranchId,
                    checkInTime=log.CheckInTime,
                    serviceStartTime=log.ServiceStartTime,
                    waitTimeInMinutes=log.WaitTimeInMinutes,
                )
                for log in db_visitor_logs
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get visitor logs: {str(e)}",
            )

    def get_visitor_logs_by_branch(
        self, db: Session, branch_id: str, skip: int = 0, limit: int = 100
    ) -> List[VisitorLogResponse]:
        """Get visitor logs for a specific branch"""
        try:
            db_visitor_logs = visitor_log_crud.get_visitor_logs_by_branch(db, branch_id, skip, limit)
            return [
                VisitorLogResponse(
                    visitorLogId=log.VisitorLogId,
                    visitorName=log.VisitorName,
                    branchId=log.BranchId,
                    checkInTime=log.CheckInTime,
                    serviceStartTime=log.ServiceStartTime,
                    waitTimeInMinutes=log.WaitTimeInMinutes,
                )
                for log in db_visitor_logs
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get visitor logs by branch: {str(e)}",
            )

    def get_visitor_logs_by_branch_last_30_days(
        self, db: Session, branch_id: str
    ) -> List[VisitorLogResponse]:
        """Get visitor logs for a specific branch in the last 30 days"""
        try:
            db_visitor_logs = visitor_log_crud.get_visitor_logs_by_branch_last_30_days(db, branch_id)
            return [
                VisitorLogResponse(
                    visitorLogId=log.VisitorLogId,
                    visitorName=log.VisitorName,
                    branchId=log.BranchId,
                    checkInTime=log.CheckInTime,
                    serviceStartTime=log.ServiceStartTime,
                    waitTimeInMinutes=log.WaitTimeInMinutes,
                )
                for log in db_visitor_logs
            ]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get visitor logs by branch last 30 days: {str(e)}",
            )

    def get_average_wait_time_by_branch(self, db: Session, branch_id: str) -> float:
        """Get average wait time for a specific branch"""
        try:
            return visitor_log_crud.get_average_wait_time_by_branch(db, branch_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get average wait time: {str(e)}",
            )

    def update_visitor_log(
        self, db: Session, visitor_log_id: str, visitor_log_update: VisitorLogUpdate
    ) -> VisitorLogResponse:
        """Update a visitor log entry"""
        try:
            db_visitor_log = visitor_log_crud.update_visitor_log(db, visitor_log_id, visitor_log_update)
            return VisitorLogResponse(
                visitorLogId=db_visitor_log.VisitorLogId,
                visitorName=db_visitor_log.VisitorName,
                branchId=db_visitor_log.BranchId,
                checkInTime=db_visitor_log.CheckInTime,
                serviceStartTime=db_visitor_log.ServiceStartTime,
                waitTimeInMinutes=db_visitor_log.WaitTimeInMinutes,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update visitor log: {str(e)}",
            )

    def delete_visitor_log(self, db: Session, visitor_log_id: str) -> bool:
        """Delete a visitor log entry"""
        try:
            return visitor_log_crud.delete_visitor_log(db, visitor_log_id)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete visitor log: {str(e)}",
            )


visitor_log_service = VisitorLogService()
