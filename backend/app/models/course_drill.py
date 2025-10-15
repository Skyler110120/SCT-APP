from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base
import enum

class DrillType(str, enum.Enum):
    TIME = "TIME"
    SCORE = "SCORE"
    ACCURACY = "ACCURACY"
    
class CourseDrill(Base):
    __tablename__ = "course_drill"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete='CASCADE'), nullable=False, index=True)
    
    drill_name = Column(String(100), nullable=False)
    drill_type = Column(Enum(DrillType), nullable=False)
    standard_value = Column(Float, nullable=False)
    standard_unit = Column(String(20), nullable=False)
    display_order = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    #Relationships
    course = relationship("Course", back_populates="drills")
    student_results = relationship("StudentDrillResult", back_populates="drill", cascade="all, delete-orphan")
    
class StudentDrillResult(Base):
    __tablename__ = "student_drill_results"
    
    id = Column(Integer, primary_key=True, index=True)
    drill_id = Column(Integer, ForeignKey("course_drill.id", ondelete='CASCADE'), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'), nullable=False, index=True)
    
    current_value = Column(Float, nullable=True)
    passed = Column(Boolean, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    drill = relationship("CourseDrill", back_populates="student_results")
    student = relationship("User", foreign_keys=[student_id], back_populates="drill_results")
    
