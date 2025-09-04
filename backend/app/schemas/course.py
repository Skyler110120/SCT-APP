from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class VideoRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    video_url: str
    order_index: int
    week_number: Optional[int]
    
    class Config:
        from_attributes = True

class CourseSummary(BaseModel):
    id: int
    title: str
    description: Optional[str]
    required_gun_type: str
    difficulty_level: str
    order_index: int
    
    class Config:
        from_attributes = True
        
class CourseStudentRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    required_gun_type: str
    difficulty_level: str
    pdf_s3_key: Optional[str] = None 
    total_weeks: int
    videos: List[VideoRead] = []
    
    class Config:
        from_attributes = True
        
class CourseInstructorRead(BaseModel):
    id: int
    title:str
    description: Optional[str]
    required_gun_type: str
    difficulty_level: str
    pdf_s3_key: Optional[str] = None
    instructor_script_s3_key: Optional[str] = None
    total_weeks: int
    videos: List[VideoRead] = []
    
    class Config:
        from_attributes = True

class CourseAdminRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    required_gun_type: str
    difficulty_level: str
    pdf_s3_key: Optional[str] = None
    instructor_script_s3_key: Optional[str] = None
    total_weeks: int
    is_active: bool
    order_index: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    videos: List[VideoRead] = []
    
    class Config:
        from_attributes = True   

class VideoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    video_url: str = Field(..., min_length=1, max_length=500)
    order_index: int = Field(..., ge=1)
    week_number: Optional[int] = Field(None, ge=1)
    
class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    video_url: Optional[str] = Field(None, max_length=500)
    order_index: Optional[int] = Field(None, ge=1)
    week_number: Optional[int] = Field(None, ge=1)
        
class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    required_gun_type: str = Field(..., min_length=1, max_length=100)
    difficulty_level: str = Field(..., min_length=1, max_length=50)
    pdf_s3_key: Optional[str] = Field(None, max_length=500)
    instructor_script_s3_key: Optional[str] = Field(None, max_length=500)
    order_index: int = Field(..., ge=1)
    
class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    required_gun_type: Optional[str] = Field(None, min_length=1, max_length=100)
    difficulty_level: Optional[str] = Field(None, min_length=1, max_length=50)
    pdf_s3_key: Optional[str] = Field(None, max_length=500)
    instructor_script_s3_key: Optional[str] = Field(None, max_length=500)
    order_index: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None 
    
    