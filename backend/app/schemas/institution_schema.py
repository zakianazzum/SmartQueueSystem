from typing import List, Optional

from pydantic import BaseModel


class BranchResponse(BaseModel):
    name: str
    branchId: str
    address: Optional[str] = None
    serviceHours: Optional[str] = None
    serviceDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    totalCrowdCount: int = 0


class InstitutionTypeResponse(BaseModel):
    institutionTypeId: str
    institutionType: str


class AdministratorResponse(BaseModel):
    userId: str
    name: str
    email: str


class InstitutionResponse(BaseModel):
    name: str
    institutionId: str
    institutionType: InstitutionTypeResponse
    administrator: AdministratorResponse
    branches: List[BranchResponse]
