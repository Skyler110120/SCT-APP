from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.models.user import User

class Profile(Base):
    __tablename__= "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True,nullable=False)
    bio = Column(Text(500), nullable=True)
    profile_picture = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    courses = Column(Text, nullable=True)  
    date_of_birth = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")