from sqlalchemy import Column, Integer, ForeignKey, Time, Enum, Date
from sqlalchemy.orm import relationship
from app.database.database import Base
import enum


class AvailabilityStatus(str, enum.Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    
class InstructorAvailability(Base):
    __tablename__ = "instructor_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    status = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.AVAILABLE, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date= Column(Date, nullable=True)

    # Relationships
    instructor = relationship("User", back_populates="availabilities")
    company = relationship("Company", back_populates="availabilities")