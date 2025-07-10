from sqlalchemy.orm import Session
from app.core.config import InviteCodeSettings
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Union

from app.models.invite_code import CompanyInviteCode
from app.models.user import User
from app.models.company import Company

def create_invite_code(db: Session, company_id: int, created_by_id: int, 
                       max_uses: int = InviteCodeSettings.MAX_USE, 
                       expires_in_days: int = InviteCodeSettings.EXPIRES_IN_DAYS):
    """
    Create a new company invite code
    
    Args:
        db: Database session
        company_id: ID of the company the code is for
        created_by_id: ID of the user creating the code
        max_uses: max uses is 1
        expires_in_days: Every code expires after 3 days 
    Returns:
    
        The created invite code
    """
    code = CompanyInviteCode.generate_code()
    while db.query(CompanyInviteCode).filter(CompanyInviteCode.code == code).first():
        code = CompanyInviteCode.generate_code()
    
    expires_at = None
    if expires_in_days is not None:
        expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
        
    db_invite_code = CompanyInviteCode(
        code=code,
        company_id=company_id,
        created_by_id=created_by_id,
        max_uses=max_uses,
        expires_at=expires_at
    )
    
    db.add(db_invite_code)
    db.commit()
    db.refresh(db_invite_code)
    
    return db_invite_code

def get_invite_codes(db: Session, company_id: Union[int, Company], skip: int = 0, limit: int = 100):
    """
    Get all invite codes for a company
    
    Args:
        db: Database session
        company_id: ID of the company
        skip: Number of invite codes to skip
        limit: Maximum number of invite codes to return
        
    Returns:
        List of invite codes
    """
    
    if isinstance(company_id, Company):
        company_id = company_id.id
    return db.query(CompanyInviteCode).filter(
        CompanyInviteCode.company_id == company_id
    ).offset(skip).limit(limit).all()
 
def get_invite_code_by_code(db: Session, code: str):
    """
    Get an invite code by its code value
    
    Args:
        db: Database session
        code: Invite code value
    
    Returns:
        The invite code if found, None otherwise
    """
    return db.query(CompanyInviteCode).filter(CompanyInviteCode.code == code).first()

def validate_invite_code(db: Session, code: str) -> Tuple[Optional[int], bool]:
    """
    Validate an invite code and check if this would be the first user in a company
    
    Args:
        db: Database session
        code: Invite code value
        
    Returns:
        Tuple of (company_id, should_be_admin) if valid, (None, False) otherwise
        should_be_admin is True if this would be the first user in the company
    """
    invite_code = get_invite_code_by_code(db, code)
    
    if not invite_code:
        return None, False
    
    if not invite_code.is_active:
        return None, False
    
    if invite_code.expires_at:
        expires_at_aware = invite_code.expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at_aware < datetime.now(timezone.utc):
        invite_code.is_active = False
        db.commit()
        return None, False
    
    if invite_code.uses >= invite_code.max_uses:
        invite_code.is_active = False
        db.commit()
        return None, False
    
    company_id = invite_code.company_id
    user_count = db.query(User).filter(User.company_id == company_id).count()
    should_be_admin = (user_count == 0)
    
    invite_code.uses += 1
    
    if invite_code.uses >= invite_code.max_uses:
        invite_code.is_active = False

    db.commit()

    return invite_code.company_id, should_be_admin