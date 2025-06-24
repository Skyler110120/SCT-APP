from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from app.models.session import SessionStatus

class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
class AvailabilityCreate(SessionBase):
    pass

class BookingCreate(BaseModel):
    availability_id: int
    
class SessionCreate(SessionBase):
    instructor_id: int

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[SessionStatus] = None
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
class SessionOut(SessionBase):
    id: int
    student_id: int
    instructor_id: int
    status: SessionStatus
        
    class Config:
        orm_mode = True
    
