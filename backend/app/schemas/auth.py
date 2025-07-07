from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class TokenData(BaseModel):
    sub: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    needs_onboarding: bool
    name: Optional[str] = None
    company_id: Optional[int] = None
    
    
class PasswordUpdate(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=255)
    new_password: str = Field(..., min_length=8, max_length=255)
    
class CompanyJoin(BaseModel):
    invite_code: str