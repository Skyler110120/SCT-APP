from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time
from app.models.instructor_availability import AvailabilityStatus

class InstructorAvailabilityBase(BaseModel):
    day_of_week: int 
    start_time: time
    end_time: time
    status: AvailabilityStatus = Field(default=AvailabilityStatus.AVAILABLE)
    start_date: date
    end_date: Optional[date] = None

class InstructorAvailabilityCreate(InstructorAvailabilityBase):
    pass
    
class InstructorAvailabilityUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[AvailabilityStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
class InstructorAvailabilityRead(InstructorAvailabilityBase):
    id: int
    instructor_id: int
    company_id: int
    
    class Config:
        orm_mode = True