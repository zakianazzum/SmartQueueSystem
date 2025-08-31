from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


# Institution Type Schemas
class InstitutionTypeResponse(BaseModel):
    institutionTypeId: str
    institutionType: str


class InstitutionTypeCreate(BaseModel):
    institutionType: str


class InstitutionTypeUpdate(BaseModel):
    institutionType: str


# Administrator Schemas
class AdministratorResponse(BaseModel):
    userId: str
    name: str
    email: str


# Branch Schemas
class BranchResponse(BaseModel):
    branchId: str
    institutionId: str
    name: str
    branchDescription: Optional[str] = None
    address: Optional[str] = None
    serviceHours: Optional[str] = None
    serviceDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    totalCrowdCount: int = 0


class BranchCreate(BaseModel):
    institutionId: str
    name: str
    branchDescription: Optional[str] = None
    address: Optional[str] = None
    serviceHours: Optional[str] = None
    serviceDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    branchDescription: Optional[str] = None
    address: Optional[str] = None
    serviceHours: Optional[str] = None
    serviceDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None


# Institution Schemas
class InstitutionResponse(BaseModel):
    institutionId: str
    institutionTypeId: Optional[str] = None
    administratorId: Optional[str] = None
    name: str
    institutionDescription: Optional[str] = None
    institutionType: Optional[InstitutionTypeResponse] = None
    administrator: Optional[AdministratorResponse] = None
    branches: List[BranchResponse] = []


class InstitutionCreate(BaseModel):
    institutionTypeId: Optional[str] = None
    administratorId: Optional[str] = None
    name: str
    institutionDescription: Optional[str] = None


class InstitutionUpdate(BaseModel):
    institutionTypeId: Optional[str] = None
    administratorId: Optional[str] = None
    name: Optional[str] = None
    institutionDescription: Optional[str] = None


# Legacy schema for backward compatibility
class BranchResponseLegacy(BaseModel):
    name: str
    branchId: str
    address: Optional[str] = None
    serviceHours: Optional[str] = None
    serviceDescription: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    totalCrowdCount: int = 0


class InstitutionResponseLegacy(BaseModel):
    name: str
    institutionId: str
    institutionType: InstitutionTypeResponse
    administrator: AdministratorResponse
    branches: List[BranchResponseLegacy]
