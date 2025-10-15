from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, func
from sqlalchemy.orm import relationship

from app.database.database import Base

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    required_gun_type = Column(String(100), nullable=False)
    difficulty_level = Column(String(50), nullable=False)
    pdf_s3_key = Column(String(500), nullable=True)
    instructor_script_s3_key = Column(String(500), nullable=True)
    total_weeks = Column(Integer, default=24)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    videos = relationship("CourseVideo", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("StudentEnrollment", back_populates="course")
    sessions = relationship("Session", back_populates="course")
    profiles = relationship("Profile", back_populates="course")
    session_form = relationship("SessionForm", back_populates="course")
    test_form = relationship("TestSessionForm", back_populates="course")
    drills = relationship("CourseDrill", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Course {self.id}: {self.title} ({self.required_gun_type})"
    
    def has_pdf(self) -> bool: 
        return bool(self.pdf_s3_key and self.pdf_s3_key.strip())
    
    def has_script(self) -> bool: 
        return bool(self.instructor_script_s3_key and self.instructor_script_s3_key.strip())
        