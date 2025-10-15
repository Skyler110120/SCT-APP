from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey
from app.database.database import Base
from sqlalchemy.sql import func
import enum
from sqlalchemy.orm import relationship
from app.models.events import event_user_association

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
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    has_completed_onboarding = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="users")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_sessions = relationship("Session", foreign_keys="[Session.student_id]", back_populates="student")
    instructor_sessions = relationship("Session", foreign_keys="[Session.instructor_id]", back_populates="instructor")
    availabilities = relationship("InstructorAvailability", back_populates="instructor", cascade="all, delete-orphan")
    events = relationship("Event", secondary=event_user_association, back_populates="users")
    created_events = relationship("Event", back_populates="created_by_user", foreign_keys="Event.created_by_user_id")
    instructor = relationship("User", remote_side=[id], back_populates="students", post_update=True)
    students = relationship("User", back_populates="instructor", cascade="save-update")
    session_form_as_instructor = relationship("SessionForm", foreign_keys=["SessionForm.instructor_id"], back_populates="instructor")
    session_form_as_student = relationship("SessionForm", foreign_keys=["SessionForm.student_id"], back_populates="student")
    test_form_as_instructor = relationship("TestSessionForm", foreign_keys=["TestSessionForm.instructor_id"], back_populates="instructor")
    test_form_as_student = relationship("TestSessionForm", foreign_keys=["TestSessionForm.student_id"], back_populates="student")
    drill_results = relationship("StudentDrillResult", foriegn_keys="[StudentDrillResult.student_id]", back_populates="student")

    def __repr__(self):
        return f"<User {self.email}"