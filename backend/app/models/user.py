from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey
from app.database.database import Base
from sqlalchemy.sql import func
import enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    MASTERADMIN = "masteradmin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    has_completed_onboarding = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="users")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_sessions = relationship("Session", foreign_keys="[Session.student_id]", back_populates="student")
    instructor_sessions = relationship("Session", foreign_keys="[Session.instructor_id]", back_populates="instructor")
    
    def __repr__(self):
        return f"<User {self.email}"