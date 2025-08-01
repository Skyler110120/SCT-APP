from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

from app.database.database import Base

class EnrollmentStatus(str, Enum):
    PENDING= "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    SUSPENDED = "suspended"
    
class StudentEnrollment(Base):
    
    __tablename__ = 'student_enrollments'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    status = Column(String(20), nullable=False, default=EnrollmentStatus.PENDING)
    enrolled_at = Column(DateTime, default=datetime.now())
    completed_at = Column(DateTime, nullable=True)
    progress_percentage = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")