from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

from app.database.database import Base

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"
    
class ProgressionDecision(str, Enum):
    APPROVED = "approved"
    NEEDS_MORE = "needs_more"
    
class StudentEnrollment(Base):
    
    __tablename__ = 'student_enrollments'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    status = Column(String(20), nullable=False, default=EnrollmentStatus.ACTIVE)
    current_week = Column(Integer, default=1)
    instructor_decision = Column(String(20), nullable=True)
    instructor_notes = Column(Text, nullable=True)
    enrolled_at = Column(DateTime, default=datetime.now())
    completed_at = Column(DateTime, nullable=True)
    last_accessed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")
    
    def __repr__(self):
        return f"<StudentEnrollment {self.id}: Student {self.student_id} Week {self.current_week}/24>"
    
    @property
    def progress_percentage(self) -> int:
        return int((self.current_week /24) * 100)
    
    @property
    def current_month(self) -> int:
        return ((self.current_week - 1) // 4) + 1
    
    @property
    def current_week_in_month(self) -> int:
        return ((self.current_week - 1) % 4) + 1
    
    @property
    def week_display(self) -> str:
        return f"Month {self.current_month} Week {self.current_week_in_month}"