from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base
import enum

from app.models.session_form import SleepQuality, PreStressLevel, PostStressLevel

class DrillType(str, enum.Enum):
    TIME = "TIME"
    SCORE = "SCORE"
    ACCURACY = "ACCURACY"
    
class TestSessionForm(Base):
    __tablename__ = "test_session_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete='SET NULL'), nullable=True, index=True)
    
    #Pre-training
    sleep_hours = Column(Integer, nullable=True) #total hourse
    sleep_quality = Column(Enum(SleepQuality), nullable=True)
    has_eaten = Column(Boolean, nullable=True) #last 4 hours
    has_pain = Column(Boolean, nullable=True) # yes/no
    pain_description = Column(String(255), nullable=True) #if yes, what/why
    pre_stress_level = Column(Enum(PreStressLevel), nullable=True)
    motivation_before = Column(Integer, nullable=True) # 1-10 scale
    
    #Post-training
    post_stress_level = Column(Enum(PostStressLevel), nullable=True)
    motivation_after = Column(Integer, nullable=True) # 1-10 scale
    confidence_level = Column(Integer, nullable=True) # 1-10 scale
    highlight = Column(String(255), nullable=True) # most proud of from session
    
    advance_student = Column(Boolean, nullable=False, default=False)
    instructor_notes = Column(Text, nullable=True)
    
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    #Relationships
    session = relationship("Session", back_populates="test_form")
    instructor = relationship("User", foreign_keys=[instructor_id])
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course")
    
    @property
    def week_number(self):
        """Get week number from student's enrollment"""
        if self.session and self.session.enrollment:
            return self.session.enrollment.current_week

