from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InviteCodeBase(BaseModel):
   pass
    
class InviteCodeCreate(InviteCodeBase):
    pass

class InviteCodeOut(BaseModel):
    id: int
    code: str
    company_id: int
    max_uses: int
    uses: int
    expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True