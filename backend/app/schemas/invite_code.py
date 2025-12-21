from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class InviteCodeBase(BaseModel):
   pass
    
class InviteCodeCreate(InviteCodeBase):
    pass

class InviteCodeOut(BaseModel):
    id: int
    code: str
    company_id: int
    created_by_id: int
    max_uses: int
    uses: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime
    role: UserRole 
    
    class Config:
        from_attributes = True