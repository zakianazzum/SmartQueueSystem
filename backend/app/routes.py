from fastapi import APIRouter

from app.api import user_api, institutions_api

router = APIRouter(prefix="/api/v1")
router.include_router(user_api.user_router)
router.include_router(institutions_api.institution_router)
