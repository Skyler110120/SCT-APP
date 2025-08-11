from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import UserRole

class TokenData(BaseModel):
    sub: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str 
    
class PasswordUpdate(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=255)
    
class CompanyJoin(BaseModel):
    invite_code: str
    
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=255)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    role: Optional[UserRole] = UserRole.STUDENT
    company_id: Optional[int] = None
    instructor_id: Optional[int] = None
    course_id: Optional[int] = None
    invite_code: str
    
    class Config:
        use_enum_values = True
    
class Token(BaseModel):
    access_token: str
    token_type: str 
    user_id: int
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    needs_onboarding: bool
    has_completed_onboarding: bool
    company_id: Optional[int] = None
    instructor_id: Optional[int] = None

    class Config:
        use_enum_values = True
    
class UserInfo(BaseModel):
    user_id: int
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    company_id: Optional[int] = None
    instructor_id: Optional[int] = None
    has_completed_onboarding: bool
    is_active: bool = True
    
    class Config:
        use_enum_values = True
        
class InviteCodeValidation(BaseModel):
    code: str 
    
class InviteCodeInfo(BaseModel):
    company_id: int
    company_name: str
    is_first_user: bool = False
    