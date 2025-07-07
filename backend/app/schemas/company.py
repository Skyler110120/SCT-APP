from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    
    @validator('slug', pre=True, always=True)
    def generate_slug(cls, v, values):
        if v:
            return v
        if 'name' in values:
            import re
            return re.sub(r'[^\w]+', '-', values['name'].lower()).strip('-')
        return v
    
class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = Field(None)
    
class CompanyOut(CompanyBase):
    id: int
    is_active: bool = Field(default=True)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class CompanyWithUserCount(CompanyOut):
    user_count: int = Field(default=0)
    
    class Config: 
        orm_mode = True    