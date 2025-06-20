from pydantic import BaseModel, EmailStr

class TokenData(BaseModel):
    sub: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str