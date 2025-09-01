from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
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
    instructor_id: Optional[int] = None
    has_completed_onboarding: bool = False
    
    @validator('instructor_id')
    def validate_instructor_id(cls, v, values):
        """Only students can have an instructor_id"""
        if v is not None and values.get('role') != UserRole.STUDENT:
            raise ValueError('Only students can be assigned to an instructor')
        return v
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, max_length=320)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    company_id: Optional[int] = None
    instructor_id: Optional[int] = None
    is_active: Optional[bool] = None
    has_completed_onboarding: Optional[bool] = None
    
    @validator('instructor_id')
    def validate_instructor_id(cls, v, values):
        """Only students can have an instructor_id"""
        if v is not None and values.get('role') != UserRole.STUDENT:
            raise ValueError('Only students can be assigned to an instructor')
        return v

class UserOut(UserBase):
    id: int
    role: UserRole
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    is_active: bool
    company_id: Optional[int] = None
    instructor_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    has_completed_onboarding: bool 
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    class Config:
        from_attributes = True
        
class UserWithStudents(UserOut):
    students: List[UserOut] = []
    
    class Config: 
        from_attributes = True

class UserWithInstructor(UserOut):
    instructor: Optional[UserOut] = None
    
    class Config:
        from_attributes = True
        
class UserWithCompany(UserOut):
    company: Optional["CompanyOut"] = None
    
    class Config:
        from_attributes = True
        
class UserComplete(UserOut):
    company: Optional["CompanyOut"] = None
    instructor: Optional[UserOut] = None
    students: List[UserOut] = []
    
    class Config:
        from_attributes = True

class UserPromoteSchema(BaseModel):
    role: UserRole = Field(..., description="New role for the user")
    
    @validator('role')
    def validate_promotion(cls, v):
        """Prevent promotion to MASTERADMIN"""
        if v == UserRole.MASTERADMIN:
            raise ValueError('Cannot promote to MASTERADMIN role')
        return v
    
class StudentInstructorAssignment(BaseModel):
    student_id: int = Field(..., description="ID of the student")
    instructor_id: int = Field(..., description="ID of the instructor")
    
    class Config:
        json_schema_extra = {
            "example": {
                "student_id": 1,
                "instructor_id": 2
            }
        }