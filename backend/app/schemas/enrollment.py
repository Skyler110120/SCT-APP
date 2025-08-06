from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.student_enrollment import EnrollmentStatus, ProgressionDecision
from app.schemas.course import CourseStudentRead

class EnrollmentCreate(BaseModel):
    course_id: int = Field(..., description="ID of the course to enroll in")
    
class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    current_week: int
    progress_percentage: int
    current_month: int
    current_week_in_month: int
    week_display: str
    instructor_decision: Optional[ProgressionDecision]
    instructor_notes: Optional[str]
    enrolled_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
        
class EnrollmentWithCourse(EnrollmentRead):
    course: CourseStudentRead
    
    class Config:
        from_attributes = True
        
class WeeklyProgressUpdate(BaseModel):
    student_id: int = Field(..., description="Student to update")
    decision: ProgressionDecision = Field(..., description="approved or needs_more")
    notes: Optional[str] = Field(None, description="Instructor feedback")
    
class StudentWeeklyProgress(BaseModel):
    enrollment_id: int 
    student_name: str
    course_title: str
    current_week: int
    week_display: str
    progress_percentage: int
    instructor_decision: Optional[ProgressionDecision]
    instructor_notes: Optional[str]
    days_since_enrollment: int
    
