from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.database import Base

class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    UNAVAILABLE = "unavailable"
    
class InstructorAvailability(Base):
    __tablename__ = "instructor_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.AVAILABLE, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    instructor = relationship("User", back_populates="availabilities")
    company = relationship("Company", back_populates="availabilities")