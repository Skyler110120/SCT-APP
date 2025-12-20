from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.user import UserRole
import secrets
from app.database.database import Base

class CompanyInviteCode(Base):
    __tablename__ = "company_invite_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(12), unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_uses = Column(Integer, default=1)
    uses = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    company = relationship("Company", back_populates="invite_codes")
    created_by = relationship("User")
    
    @classmethod
    def generate_code(cls):
        """Generate a random invite code"""
        return secrets.token_urlsafe(8)[:12]