from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class WaitTimePredictionBase(BaseModel):
    visitorId: str
    branchId: str
    visitDate: datetime
    predictedWaitTime: float
    actualWaitTime: float
    accuracy: float


class WaitTimePredictionCreate(BaseModel):
    waitTimePredictionId: str
    visitorId: str
    branchId: str
    visitDate: datetime
    predictedWaitTime: float
    actualWaitTime: float
    accuracy: float
    predictedAt: datetime


class WaitTimePredictionUpdate(BaseModel):
    visitorId: Optional[str] = None
    branchId: Optional[str] = None
    visitDate: Optional[datetime] = None
    predictedWaitTime: Optional[float] = None
    actualWaitTime: Optional[float] = None
    accuracy: Optional[float] = None


class WaitTimePredictionResponse(WaitTimePredictionBase):
    waitTimePredictionId: str
    predictedAt: datetime

    class Config:
        from_attributes = True


class WaitTimePredictionRequest(BaseModel):
    visitorId: str
    branchId: str
    visitDate: datetime
