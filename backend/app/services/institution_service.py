from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.crud import CRUDBase
from app.db.session import get_db
from app.models import Branch, Institution

institution_crud = CRUDBase(model=Institution)


class InstitutionService:
    def __init__(self):
        pass

    def get_all_institutions(self, db: Session) -> list[Institution]:
        print("Fetching all institutions from service")
        institutions = institution_crud.get_multi(db=db)

        if not institutions:
            raise Exception("Institutions not found")
        return institutions


institution_service = InstitutionService()
