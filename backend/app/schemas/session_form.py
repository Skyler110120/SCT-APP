from pydantic import BaseModel, Field, validator, root_validator
from typing import Optional
from datetime import datetime
from enum import Enum

class SleepQuality(str, Enum):
    POOR = "POOR"
    AVERAGE = "AVERAGE"
    GREAT = "GREAT"
    
class PreStressLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    
class PostStressLevel(str, Enum):
    LESS_STRESSED = "LESS_STRESSED"
    SAME = "SAME"
    MORE_STRESSED = "MORE_STRESSED"
    
class SessionFormCreate(BaseModel):
    session_id: int = Field(..., gt=0)
    
class SessionFormUpdate(BaseModel):
    sleep_hours: Optional[int] = Field(None, ge=0, le=24)
    sleep_quality: Optional[SleepQuality] = None
    has_eaten: Optional[bool] = None
    has_pain: Optional[bool] = None
    pain_description: Optional[str] = Field(None, max_length=255)
    pre_stress_level: Optional[PreStressLevel] = None
    motivation_before: Optional[int] = Field(None, ge=1, le=10)
    
    post_stress_level: Optional[PostStressLevel] = None
    motivation_after: Optional[int] = Field(None, ge=1, le=10)
    confidence_level: Optional[int] = Field(None, ge=1, le=10)
    highlight: Optional[str] = Field(None, max_length=255)
    
    advance_student: Optional[bool] = None
    instructor_notes: Optional[str] = Field(None, max_length=2000)
    
    @validator('pain_description')
    def validate_pain_description(cls, v, values):
        has_pain = values.get('has_pain')
        if has_pain is True and (not v or not v.strip()):
            raise ValueError('pain_description is required when pain is reported')
        return v

class SessionFormComplete(BaseModel):
    sleep_hours: Optional[int] = Field(None, ge=0, le=24)
    sleep_quality: Optional[SleepQuality] = None
    has_eaten: Optional[bool] = None
    has_pain: Optional[bool] = None
    pain_description: Optional[str] = Field(None, max_length=255)
    pre_stress_level: Optional[PreStressLevel] = None
    motivation_before: Optional[int] = Field(None, ge=1, le=10)
    
    post_stress_level: Optional[PostStressLevel] = None
    motivation_after: Optional[int] = Field(None, ge=1, le=10)
    confidence_level: Optional[int] = Field(..., ge=1, le=10)
    highlight: Optional[str] = Field(None, max_length=255)
    
    advance_student: bool = Field(...)
    instructor_notes: Optional[str] = Field(None, max_length=2000)
    
    @validator('pain_description')
    def validate_pain_description(cls, v, values):
        has_pain = values.get('has_pain')
        if has_pain is True and (not v or not v.strip()):
            raise ValueError('pain_description is required when pain is reported')
        return v
    
class SessionFormOut(BaseModel):
    id: int
    session_id: int
    instructor_id: int
    student_id: int
    course_id: Optional[int]
    week_number: int
    
    sleep_hours: Optional[int]
    sleep_quality: Optional[SleepQuality]
    has_eaten: Optional[bool]
    has_pain: Optional[bool]
    pain_description: Optional[str]
    pre_stress_level: Optional[PreStressLevel]
    motivation_before: Optional[int]
    
    post_stress_level: Optional[PostStressLevel]
    motivation_after: Optional[int]
    confidence_level: Optional[int]
    highlight: Optional[str]
    
    advance_student: bool
    instructor_notes: Optional[str]
    
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True
    