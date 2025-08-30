from fastapi import APIRouter

from app.api import user_api

router = APIRouter(prefix="/api/v1")
router.include_router(user_api.user_router)
