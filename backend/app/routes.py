from fastapi import APIRouter

from app.api import user_api, institutions_api, crowd_data_api, visitor_log_api, wait_time_prediction_api

router = APIRouter(prefix="/api/v1")
router.include_router(user_api.user_router)
router.include_router(crowd_data_api.crowd_data_router)
router.include_router(institutions_api.institution_router)
router.include_router(visitor_log_api.visitor_log_router)
router.include_router(wait_time_prediction_api.wait_time_prediction_router)
