from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship

from app.database.database import Base

class CourseVideo(Base):
    __tablename__ = 'course_videos'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    order_index = Column(Integer, nullable=False)
    week_number = Column(Integer, nullable=True)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    # Relationships
    course = relationship("Course", back_populates="videos")
    
    def __repr__(self):
        return f"<CourseVideo {self.id}: {self.title} (Course: {self.course_id})>"
    