from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    required_gun_type = Column(String(100), nullable=False)
    duration = Column(Integer, nullable=True)
    pdf_url = Column(String(500), nullable=True)
    instructor_script_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    # Relationships
    videos = relationship("Video", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("StudentEnrollment", back_populates="course")
    
    def __repr__(self):
        return f"<Course {self.id}: {self.title} ({self.required_gun_type})"