from typing import List, Optional

from pydantic import BaseModel


class BranchResponse(BaseModel):
    name: str
    branchId: str


class InstitutionResponse(BaseModel):
    name: str
    institutionId: str
    branches: List[BranchResponse]
