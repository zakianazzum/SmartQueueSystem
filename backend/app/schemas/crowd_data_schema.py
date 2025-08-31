from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CrowdDataBase(BaseModel):
    branchId: str
    timestamp: datetime
    currentCrowdCount: int


class CrowdDataCreate(CrowdDataBase):
    pass


class CrowdDataUpdate(BaseModel):
    branchId: Optional[str] = None
    timestamp: Optional[datetime] = None
    currentCrowdCount: Optional[int] = None


class CrowdDataResponse(CrowdDataBase):
    crowdDataId: str

    class Config:
        from_attributes = True


class CrowdDataWithBranchResponse(CrowdDataResponse):
    branch: dict  # Will contain branch information
