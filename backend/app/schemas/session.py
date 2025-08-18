from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime
from app.models.session import SessionStatus

class SessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    start_time: datetime
    end_time: datetime
    
    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Session title cannot be empty')
        return v.strip()
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
    @validator('start_time')
    def start_time_must_be_in_future(cls, v):
        if v <= datetime.now():
            raise ValueError('start_time must be in the future')
        return v
    
class SessionCreate(SessionBase):
    instructor_id: int
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    enrollment_id: Optional[int] = None
    status: Optional[SessionStatus] = SessionStatus.SCHEDULED

class SessionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[SessionStatus] = None
    course_id: Optional[int] = None
    enrollment_id: Optional[int] = None
    
    @validator('title')
    def title_must_not_be_empty(cls, v):
        if v and (not v or not v.strip()):
            raise ValueError('Session title cannot be empty')
        return v.strip()
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
    @validator('start_time')
    def start_time_must_be_in_future(cls, v):
        if v and v <= datetime.now():
            raise ValueError('start_time must be in the future')
        return v
    
class SessionOut(SessionBase):
    id: int
    instructor_id: int
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    enrollment_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: SessionStatus
    created_at: datetime
    updated_at: datetime
        
    class Config:
        orm_mode = True

class SessionOutDetailed(SessionOut):
    # Course info
    course_title: Optional[str] = None
    course_description: Optional[str] = None
    
    # User info
    instructor_name: Optional[str] = None
    instructor_email: Optional[str] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    company_name: Optional[str] = None
    
    # Computed fields
    duration_minutes: Optional[int] = None
    can_be_cancelled: Optional[bool] = None
    can_be_completed: Optional[bool] = None
    
    # Enrollment info
    enrollment_course_title: Optional[str] = None
    enrollment_course_description: Optional[str] = None
    enrollment_course_gun_type: Optional[str] = None
    enrollment_course_difficulty: Optional[str] = None
    enrollment_current_week: Optional[int] = None
    enrollment_progress_display: Optional[str] = None
    enrollment_progress_percentage: Optional[float] = None
    enrollment_status: Optional[str] = None
    enrollment_instructor_notes: Optional[str] = None
    
    class Config:
        orm_mode = True
        
class DirectBookingCreate(SessionBase):
    instructor_id: int
    student_id: Optional[int] = None

class AvailabilityCheckResponse(BaseModel):
    available: bool
    conflicts: list = []
    message: str