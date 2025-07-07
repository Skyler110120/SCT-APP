from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

from app.schemas.company import CompanyOut

class UserBase(BaseModel):
    email: EmailStr = Field(..., max_length=320)
    role: Optional[UserRole] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    role: UserRole = UserRole.STUDENT
    company_id: Optional[int] = None
    has_completed_onboarding: bool = False
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, max_length=320)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    company_id: Optional[int] = None
    is_active: Optional[bool] = None
    has_compledted_onboarding: Optional[bool] = None

class UserOut(UserBase):
    id: int
    role: UserRole
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    company_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    has_completed_onboarding: bool 
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    class Config:
        orm_mode = True
        
class UserWithCompany(UserOut):
    company: Optional["CompanyOut"] = None
    
    class Config:
        orm_mode = True

class UserPromoteSchema(BaseModel):
    role: UserRole = Field(..., description="New role for the user")
        

