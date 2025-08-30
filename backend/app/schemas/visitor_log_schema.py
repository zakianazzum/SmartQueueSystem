from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VisitorLogBase(BaseModel):
    visitorName: str
    branchId: str
    checkInTime: datetime
    serviceStartTime: datetime
    waitTimeInMinutes: int


class VisitorLogCreate(BaseModel):
    visitorName: str
    branchId: str
    checkInTime: datetime
    serviceStartTime: datetime
    waitTimeInMinutes: Optional[int] = None


class VisitorLogUpdate(BaseModel):
    visitorName: Optional[str] = None
    branchId: Optional[str] = None
    checkInTime: Optional[datetime] = None
    serviceStartTime: Optional[datetime] = None
    waitTimeInMinutes: Optional[int] = None


class VisitorLogResponse(VisitorLogBase):
    visitorLogId: str

    class Config:
        from_attributes = True
