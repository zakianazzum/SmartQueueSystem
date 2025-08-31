from fastapi import Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.db.crud import CRUDBase
from app.db.session import get_db
from app.models import (
    Branch,
    Institution,
    InstitutionType,
    Administrator,
    User,
    CrowdData,
)

institution_crud = CRUDBase(model=Institution)


class InstitutionService:
    def __init__(self):
        pass

    def get_all_institutions(self, db: Session) -> list[Institution]:
        # Use joinedload to eagerly load all related data
        institutions = (
            db.query(Institution)
            .options(
                joinedload(Institution.branches),
                joinedload(Institution.institution_type),
                joinedload(Institution.administrator).joinedload(Administrator.user),
            )
            .all()
        )

        if not institutions:
            raise Exception("Institutions not found")

        # Calculate total crowd count for each branch
        for institution in institutions:
            for branch in institution.branches:
                # Get total crowd count for this branch
                total_crowd_count = (
                    db.query(func.sum(CrowdData.CurrentCrowdCount))
                    .filter(CrowdData.BranchId == branch.BranchId)
                    .scalar()
                )
                # Add total crowd count as a property to the branch object
                branch.total_crowd_count = total_crowd_count or 0

        return institutions


institution_service = InstitutionService()
