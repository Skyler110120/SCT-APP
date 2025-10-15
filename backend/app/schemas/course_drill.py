from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

from app.models.course_drill import DrillType

class CourseDrillCreate(BaseModel):
    """Schema for creating a new Course Drill"""
    course_id: int = Field(..., gt=0)
    drill_name: str = Field(..., min_length = 1, max_length = 100)
    drill_type: DrillType
    standard_value: float = Field(..., gt=0)
    standard_unit: str = Field(..., min_length = 1, max_length = 20)
    display_order: Optional[int] = Field(1, ge=1)
    description: Optional[str] = Field(None, max_length = 1000)
    
    @validator('drill_name')
    def drill_name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Drill name cannot be empty')
        return v.strip()

    @validator('standard_unit')
    def standard_unit_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Standard unit cannot be empty')
        return v.strip()

class CourseDrillUpdate(BaseModel):
    """Schema for updating an existing Course Drill"""
    drill_name: Optional[str] = Field(None, min_length = 1, max_length = 100)
    drill_type: Optional[DrillType] = None
    standard_value: Optional[float] = Field(None, gt=0)
    standard_unit: Optional[str] = Field(None, min_length = 1, max_length = 20)
    display_order: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, max_length = 1000)
    is_active: Optional[bool] = None
    
    @validator('drill_name')
    def drill_name_not_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Drill name cannot be empty')
        return v.strip()

class CourseDrillOut(BaseModel):
    """Schema for returning drill data to frontend"""
    id: int
    course_id: int
    
    drill_name: str
    drill_type: DrillType
    standard_value: float
    standard_unit: str
    display_order: int
    description: Optional[str]
    is_active: bool
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
    
class StudentDrillResultCreate(BaseModel):
    """Schema for creating a new student drill result record"""
    
    drill_id: int = Field(..., gt=0)
    student_id: int = Field(..., gt=0)
    current_value: Optional[float] = None
    passed: Optional[bool] = None

class StudentDrillResultUpdate(BaseModel):
    """Schema for updating an existing student drill result record"""
    
    drill_id: int = Field(..., gt=0)
    current_value: float 
    passed: Optional[bool] = None
    
    @validator('current_value')
    def current_value_positive(cls, v):
        if v is None or v < 0:
            raise ValueError('Current value must be a positive')
        return v

class StudentDrillResultOut(BaseModel):
    """Schema for returning student drill result with drill information"""
    
    result_id: int
    drill_id: int
    student_id: int
    current_value: Optional[float]
    passed: Optional[bool]
    result_created_at: datetime
    result_updated_at: datetime
    
    drill_name: str
    drill_type: DrillType
    standard_value: float
    standard_unit: str
    description: Optional[str]
    
    beat_standard: Optional[bool] = None
    difference_from_standard: Optional[float] = None
    status: str = "Not Tested"
    
    class Config:
        from_attributes = True
        
    @validator('beat_standard', pre=False, always=True)
    def caluclate_beat_standard(cls, v, values):
        current_value = values.get('current_value')
        drill_type = values.get('drill_type')
        standard_value = values.get('standard_value')
        
        if current_value is None:
            return None
        if drill_type == DrillType.TIME:
            return current_value <= standard_value
        else:
            return current_value >= standard_value
    
    @validator('difference_from_standard', pre=False, always=True)
    def calculate_difference_from_standard(cls, v, values):
        current_value = values.get('current_value')
        standard_value = values.get('standard_value')
        
        if current_value is None:
            return None
        return current_value - standard_value
    
    @validator('status', pre=False, always=True)
    def calculate_status(cls, v, values):
        current_value = values.get('current_value')
        passed = values.get('passed')
        
        if current_value is None:
            return "Not Tested"
        elif passed:
            return "Passed"
        else:
            return "Needs improvement"
    
class StudentDrillSummary(BaseModel):
    """Schema for a complete overview of a student's drill performance"""
    student_id: int
    course_id: int
    
    total_drills: int
    tested_drills: int
    passed_drills: int
    completion_percentage: float
    
    drill_results: List[StudentDrillResultOut] = []
    
    @validator('completion_percentage', pre=False, always=True)
    def calculate_completion_percentage(cls, v, values):
        total = values.get('total_drills', 0)
        tested = values.get('tested_drills', 0)
        
        if total == 0:
            return 0.0
        return round((tested / total) * 100, 1)
    