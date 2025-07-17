from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    image: Optional[str] = None
    
class EventUpdate(EventBase):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    user_ids: Optional[List[int]] = None
    
class EventCreate(EventBase):
    company_id: int

class EventRead(EventBase):
    id: int
    company_id: int
    user_ids: Optional[List[int]] = None
    created_by_user_id: Optional[int] = None
    
    class Config:
        orm_mode = True

