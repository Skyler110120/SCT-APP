from pydantic import BaseModel, validator
from typing import Optional

class ProfileBase(BaseModel):
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    courses: Optional[str] = None
    date_of_birth: Optional[str] = None
    
class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True