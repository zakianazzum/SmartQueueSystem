from pydantic import UUID4
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException, status

from app.models import User
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.schemas.user_schema import (
    LoginRequest,
    UserResponse,
)

from app.services.user_service import get_active_user, user_service

user_router = APIRouter()


@user_router.post("/auth/login", tags=["auth"])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        if user_service.validate_user(
            email=request.email, password=request.password, db=db
        ):
            access_token = request.email
            return JSONResponse(
                content={
                    "message": "Successfully Logged In",
                    "access_token": access_token,
                },
                status_code=status.HTTP_200_OK,
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@user_router.get("/user/me", response_model=UserResponse, tags=["users"])
def get_current_user(current_user: User = Depends(get_active_user)):
    try:
        return JSONResponse(
            content=jsonable_encoder(UserResponse(**jsonable_encoder(current_user))),
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
