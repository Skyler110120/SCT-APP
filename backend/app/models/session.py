from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from app.database.database import Base

class SessionStatus(str, enum.Enum):
    AVAILABLE = "available"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)

    # Start and end times
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    # Session details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    #Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="student_sessions")
    instructor = relationship("User", foreign_keys=[instructor_id], back_populates="instructor_sessions")
    company = relationship("Company", back_populates="sessions")
    
    def __repr__(self):
        return f"<Session {self.title} ({self.start_time} to {self.end_time})>"
