from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base

class CourseVideo(Base):
    __tablename__ = 'course_videos'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    druation_seconds = Column(Integer, nullable=True)
    order_index = Column(Integer, nullable=False)
    is_preview = Column(Boolean, default=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    # Relationships
    course = relationship("Course", back_populates="videos")
    
    def __repr__(self):
        return f"<CourseVideo {self.id}: {self.title} (Course: {self.course_id})>"
    