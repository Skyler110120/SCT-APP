from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MaterialAccessRequest(BaseModel):
    """
    implemented in the future
    """
    pass

class MaterialAccessResponse(BaseModel):
    success: bool = True
    access_url: str = Field(description="Temporary URL for viewing material")
    expires_at: str = Field(description="When the access URL expires")
    expires_in_seconds: int = Field(description="Seconds until URL expires")
    material_type: str = Field(description="course_pdf or instructor_script")
    course_title: str = Field(description="Course title")
    course_id: int

class MaterialInfoResponse(BaseModel):
    course_id: int
    course_title: str
    has_pdf: bool = Field(description="Whether the course has PDF material")
    has_script: bool = Field(description="Whether the course has instructor script")
    can_access_script: bool = Field(description="Whether user can access script")
    
class MaterialErrorResponse(BaseModel):
    success: bool = False
    error_type: str = Field(description="Machine-readable error type")
    message: str = Field(description="Human-readable error message")
    course_id: Optional[int] = None