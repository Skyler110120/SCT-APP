from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

from app.models.session_form import SleepQuality, PreStressLevel, PostStressLevel
from app.schemas.course_drill import StudentDrillResultUpdate, StudentDrillSummary

class TestSessionFormCreate(BaseModel):
    session_id: int = Field(..., gt=0)

class TestSessionFormUpdate(BaseModel):
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
    
    drill_updates: Optional[List[StudentDrillResultUpdate]] = None
    
    @validator('pain_description')
    def validate_pain_description(cls, v, values):
        has_pain = values.get('has_pain')
        if has_pain is True and (not v or not v.strip()):
            raise ValueError('pain_description is required when pain is reported')
        return v

class TestSessionFormComplete(BaseModel):
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
    
    drill_updates: Optional[List[StudentDrillResultUpdate]] = None
    
    @validator('pain_description')
    def validate_pain_description(cls, v, values):
        has_pain = values.get('has_pain')
        if has_pain is True and (not v or not v.strip()):
            raise ValueError('pain_description is required when pain is reported')
        return v

class TestSessionFormOut(BaseModel):
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
    
    available_drills: List[StudentDrillSummary] = Field(None)
    
    class Config:
        from_attributes = True