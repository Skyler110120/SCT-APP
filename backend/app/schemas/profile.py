from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date

class ProfileBase(BaseModel):
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    course_id: Optional[int] = None
    email: Optional[EmailStr] = None
    
    class Config:
        from_attributes = True
    
    @validator('date_of_birth', pre=True)
    def parse_date_of_birth(cls, v):
        """Handle different date input formats"""
        if v is None:
            return v
        
        if isinstance(v, date):
            return v
            
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                try:
                    from datetime import datetime
                    return datetime.strptime(v, "%m/%d/%Y").date()
                except ValueError:
                    raise ValueError("Date must be in YYYY-MM-DD or MM/DD/YYYY format")
        
        raise ValueError("Invalid date format")
class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    
    class Config:
        orm_mode = True

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    
    class Config:
        orm_mode = True
        
class ProfileOut(ProfileBase):
    id: int
    user_id: int
    bio: Optional[str] = None
    course: Optional[CourseOut] = None
    user: UserOut
    
    class Config:
        orm_mode = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }