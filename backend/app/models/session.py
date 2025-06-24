from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
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

    # Start and end times
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    # Session details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    
    #Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="student_sessions")
    instructor = relationship("User", foreign_keys=[instructor_id], back_populates="instructor_sessions")
