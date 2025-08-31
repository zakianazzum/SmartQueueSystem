from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# User Schemas
class UserResponse(BaseModel):
    userId: str
    name: str
    email: str
    role: str
    createdAt: datetime
    updatedAt: datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    password: Optional[str] = None


# Operator Schemas
class OperatorResponse(BaseModel):
    userId: str
    branchId: str
    user: UserResponse
    branch: Optional[dict] = None  # Basic branch info


class OperatorCreate(BaseModel):
    userId: str
    branchId: str


class OperatorUpdate(BaseModel):
    branchId: Optional[str] = None


# Visitor Schemas
class VisitorResponse(BaseModel):
    userId: str
    user: UserResponse


class VisitorCreate(BaseModel):
    userId: str


# Favorite Institution Schemas
class FavoriteInstitutionResponse(BaseModel):
    favoriteInstitutionId: str
    visitorId: str
    branchId: str
    createdAt: datetime
    branch: Optional[dict] = None  # Basic branch info


class FavoriteInstitutionCreate(BaseModel):
    visitorId: str
    branchId: str


class FavoriteInstitutionUpdate(BaseModel):
    branchId: Optional[str] = None


# Alert Preference Schemas
class AlertPreferenceResponse(BaseModel):
    alertId: str
    visitorId: str
    branchId: str
    crowdThreshold: int
    createdAt: datetime
    branch: Optional[dict] = None  # Basic branch info


class AlertPreferenceCreate(BaseModel):
    visitorId: str
    branchId: str
    crowdThreshold: int


class AlertPreferenceUpdate(BaseModel):
    branchId: Optional[str] = None
    crowdThreshold: Optional[int] = None


# Administrator Schemas
class AdministratorResponse(BaseModel):
    userId: str
    user: UserResponse


class AdministratorCreate(BaseModel):
    userId: str


# Branch Info for nested responses
class BranchInfo(BaseModel):
    branchId: str
    name: str
    address: Optional[str] = None
    serviceHours: Optional[str] = None
