from pydantic import UUID4
from sqlalchemy.orm import Session
from fastapi import Depends, Request

from app.models import User
from app.db.crud import CRUDBase
from app.db.session import get_db

user_crud = CRUDBase(model=User)


def get_active_user(request: Request, db: Session = Depends(get_db)) -> User:
    email = request.app.state.user
    user = user_crud.get_by_field(db=db, field="email", value=email)
    if not user:
        raise
    return user


class UserService:
    def __init__(self):
        pass

    def get_user_by_id(self, db: Session, user_id: UUID4) -> User:
        user = user_crud.get(db=db, id=user_id)

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
