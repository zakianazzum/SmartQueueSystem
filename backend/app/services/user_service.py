from pydantic import UUID4
from sqlalchemy.orm import Session
from fastapi import Depends, Request

from app.models import User
from app.db.crud import CRUDBase
from app.db.session import get_db

user_crud = CRUDBase(model=User)


class UserService:
    def __init__(self):
        pass

    def get_by_email(self, db: Session, email: str) -> User:
        user = user_crud.get_by_field(db=db, field="Email", value=email)

        if not user:
            raise Exception("User not found")
        return user

    def validate_user(
        self, email: str, password: str, db: Session = Depends(get_db)
    ) -> bool:
        user = user_crud.get_by_field(db=db, field="Email", value=email)
        if user:
            if password == user.Password:
                return True
            else:
                raise Exception("Invalid password")
        else:
            raise Exception("Email not found")


user_service = UserService()
