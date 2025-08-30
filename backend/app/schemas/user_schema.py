from typing import List, Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    role: str
    email: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
