from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    MASTERADMIN = "masteradmin"

class UserBase(BaseModel):
    email: EmailStr
    role: Optional[UserRole] = None

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str

class UserOut(UserBase):
    id: int
    first_name: str
    last_name: str

    class Config:
        orm_mode = True