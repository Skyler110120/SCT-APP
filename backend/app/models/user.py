from sqlalchemy import Column, Integer, String, Enum
from app.database.database import Base
import enum
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    MASTERADMIN = "masteradmin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_sessions = relationship("Session", foreign_keys="[Session.student_id]", back_populates="student")
    instructor_sessions = relationship("Session", foreign_keys="[Session.instructor_id]", back_populates="instructor")