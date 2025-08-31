from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.db.crud import CRUDBase
from app.models import CrowdData, Branch
from app.schemas.crowd_data_schema import CrowdDataCreate, CrowdDataUpdate

crowd_data_crud = CRUDBase(model=CrowdData)


class CrowdDataService:
    def __init__(self):
        pass

    def create_crowd_data(
        self, db: Session, crowd_data: CrowdDataCreate, crowd_data_id: str
    ) -> CrowdData:
        """Create a new crowd data entry"""
        try:
            # Create the crowd data object
            db_crowd_data = CrowdData(
                CrowdDataId=crowd_data_id,
                BranchId=crowd_data.branchId,
                Timestamp=crowd_data.timestamp,
                CurrentCrowdCount=crowd_data.currentCrowdCount,
            )

            db.add(db_crowd_data)
            db.commit()
            db.refresh(db_crowd_data)
            return db_crowd_data
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create crowd data: {str(e)}",
            )

    def get_crowd_data(self, db: Session, crowd_data_id: str) -> Optional[CrowdData]:
        """Get a single crowd data entry by ID"""
        crowd_data = (
            db.query(CrowdData)
            .options(joinedload(CrowdData.branch))
            .filter(CrowdData.CrowdDataId == crowd_data_id)
            .first()
        )

        if not crowd_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Crowd data not found"
            )
        return crowd_data

    def get_all_crowd_data(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CrowdData]:
        """Get all crowd data entries with pagination"""
        crowd_data = (
            db.query(CrowdData)
            .options(joinedload(CrowdData.branch))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return crowd_data

    def get_crowd_data_by_branch(
        self, db: Session, branch_id: str, skip: int = 0, limit: int = 100
    ) -> List[CrowdData]:
        """Get crowd data for a specific branch"""
        crowd_data = (
            db.query(CrowdData)
            .options(joinedload(CrowdData.branch))
            .filter(CrowdData.BranchId == branch_id)
            .order_by(CrowdData.Timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return crowd_data

    def get_latest_crowd_data_by_branch(
        self, db: Session, branch_id: str
    ) -> Optional[CrowdData]:
        """Get the latest crowd data for a specific branch"""
        crowd_data = (
            db.query(CrowdData)
            .options(joinedload(CrowdData.branch))
            .filter(CrowdData.BranchId == branch_id)
            .order_by(CrowdData.Timestamp.desc())
            .first()
        )
        return crowd_data

    def update_crowd_data(
        self, db: Session, crowd_data_id: str, crowd_data_update: CrowdDataUpdate
    ) -> CrowdData:
        """Update a crowd data entry"""
        try:
            # Get existing crowd data
            db_crowd_data = self.get_crowd_data(db, crowd_data_id)

            # Update fields if provided
            update_data = crowd_data_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                # Convert camelCase to PascalCase for SQLAlchemy model
                if field == "branchId":
                    setattr(db_crowd_data, "BranchId", value)
                elif field == "currentCrowdCount":
                    setattr(db_crowd_data, "CurrentCrowdCount", value)
                elif field == "timestamp":
                    setattr(db_crowd_data, "Timestamp", value)

            db.commit()
            db.refresh(db_crowd_data)
            return db_crowd_data
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update crowd data: {str(e)}",
            )

    def delete_crowd_data(self, db: Session, crowd_data_id: str) -> bool:
        """Delete a crowd data entry"""
        try:
            # Get existing crowd data
            db_crowd_data = self.get_crowd_data(db, crowd_data_id)

            db.delete(db_crowd_data)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete crowd data: {str(e)}",
            )

    def get_crowd_data_by_date_range(
        self, db: Session, branch_id: str, start_date: datetime, end_date: datetime
    ) -> List[CrowdData]:
        """Get crowd data for a specific branch within a date range"""
        crowd_data = (
            db.query(CrowdData)
            .options(joinedload(CrowdData.branch))
            .filter(
                CrowdData.BranchId == branch_id,
                CrowdData.Timestamp >= start_date,
                CrowdData.Timestamp <= end_date,
            )
            .order_by(CrowdData.Timestamp.asc())
            .all()
        )
        return crowd_data


crowd_data_service = CrowdDataService()
