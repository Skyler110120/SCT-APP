from sqlalchemy.orm import Session
from app.core.config import InviteCodeSettings
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Union
import logging

from app.models.invite_code import CompanyInviteCode
from app.models.user import User
from app.models.company import Company
from app.schemas.auth import InviteCodeInfo

logger = logging.getLogger(__name__)

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
    try:
        logger.info(f"Creating invite code for company {company_id}")
        
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
        
        logger.info(f"Created invite code {code} for company {company_id}")
        return db_invite_code
    except Exception as e:
        logger.error(f"Error creating invite code for company {company_id}: {e}")
        db.rollback()
        raise

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
    
    try:    
        if isinstance(company_id, Company):
            company_id = company_id.id
            
        return db.query(CompanyInviteCode).filter(
            CompanyInviteCode.company_id == company_id,
            is_active = True
        ).offset(skip).limit(limit).all()
        
    except Exception as e:
        logger.error(f"Error getting invite codes for company {company_id}: {e}")
        return []
    
def get_invite_code_by_code(db: Session, code: str):
    """
    Get an invite code by its code value
    
    Args:
        db: Database session
        code: Invite code value
    
    Returns:
        The invite code if found, None otherwise
    """
    try:
        return db.query(CompanyInviteCode).filter(CompanyInviteCode.code == code).first()
    except Exception as e:
        logger.error(f"Error looking up invite code {code[:4]}...: {e}")
        return None

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
    try:
        logger.info(f"Legacy invite code validation for: {code[:4]}...")
        
        invite_code = get_invite_code_by_code(db, code)
        
        if not invite_code:
            logger.warning(f"Invite code not found: {code[:4]}...")
            return None, False
        
        if not invite_code.is_active:
            logger.warning(f"Invite code inactive: {code[:4]}...")
            return None, False

        if invite_code.expires_at:
            expires_at_aware = invite_code.expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at_aware < datetime.now(timezone.utc):
                logger.warning(f"Invite code expired: {code[:4]}...")
                invite_code.is_active = False
                db.commit()
                return None, False
        
        if invite_code.uses >= invite_code.max_uses:
            logger.warning(f"Invite code usage limit reached: {code[:4]}...")
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
        
        logger.info(f"Legacy invite code validation successful: {code[:4]}...")
        return invite_code.company_id, should_be_admin
        
    except Exception as e:
        logger.error(f"Error in legacy invite code validation: {e}")
        db.rollback()
        return None, False

def validate_invite_code_info(db: Session, code: str) -> Optional[InviteCodeInfo]:
    """
    Validate an invite code and return company information
    
    Args:
        db: Database session
        code: Invite code value
        
    Returns:
        InviteCodeInfo schema if valid, None otherwise
    """
    try:
        logger.info(f"Validating invite code info: {code[:4]}...")
        
        invite_code = get_invite_code_by_code(db, code)
    
        if not invite_code:
            logger.warning(f"Invite code not found: {code[:4]}...")
            return None
    
        if not invite_code.is_active:
            logger.warning(f"Invite code is not active: {code[:4]}...")
            return None
    
        if invite_code.expires_at:
            expires_at_aware = invite_code.expires_at.replace(tzinfo=timezone.utc)
        
            if expires_at_aware < datetime.now(timezone.utc):
                logger.warning(f"Invite code has expired: {code[:4]}...")
                return None
    
        if invite_code.uses >= invite_code.max_uses:
            logger.warning(f"Invite code has reached max uses: {code[:4]}...")
            return None
    
        company = db.query(Company).filter(Company.id == invite_code.company_id).first()
    
        if not company:
            logger.warning(f"Company not found for invite code: {code[:4]}...")
            return None
    
        user_count = db.query(User).filter(User.company_id == invite_code.company_id).count()
        is_first_user = (user_count == 0)
        
        logger.info(f"Invite code info validated for company: {company.name}")
        logger.debug(f"Company {company.name} has {user_count} users, is_first_user: {is_first_user}")
    
        return InviteCodeInfo(
            company_id=invite_code.company_id,
            company_name=company.name,
            if_first_user=is_first_user
        )
    
    except Exception as e:
        logger.error(f"Error validating invite code info: {e}")
        return None
    
def consume_invite_code(db: Session, code: str) -> bool:
    """
    Consume an invite code
    Called during user signup after validation
    
    Args:
        db: Database session
        code: Invite code value
        
    Returns:
        True if successfully consumed, False otherwise
    """
    
    try:
        logger.info(f"Attempting to consume invite code: {code[:4]}...")
        
        invite_code = get_invite_code_by_code(db, code)
        
        if not invite_code:
            logger.warning(f"Cannot consume - invite code not found: {code[:4]}...")
            return False
            
        if not invite_code.is_active:
            logger.warning(f"Cannot consume - invite code inactive: {code[:4]}...")
            return False
        
        if invite_code.expires_at:
            expires_at_aware = invite_code.expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at_aware < datetime.now(timezone.utc):
                logger.warning(f"Cannot consume - invite code expired: {code[:4]}...")
                invite_code.is_active = False
                db.commit()
                return False
        
        if invite_code.uses >= invite_code.max_uses:
            logger.warning(f"Cannot consume - usage limit reached: {code[:4]}...")
            invite_code.is_active = False
            db.commit()
            return False
        
        old_uses = invite_code.uses
        invite_code.uses += 1
        
        if invite_code.uses >= invite_code.max_uses:
            invite_code.is_active = False
            logger.info(f"Invite code {code[:4]}... has reached usage limit and been deactivated")
        
        db.commit()
        
        logger.info(
            f"Invite code consumed successfully: {code[:4]}... "
            f"(usage: {old_uses} → {invite_code.uses}/{invite_code.max_uses})"
        )
        return True
    except Exception as e:
        logger.error(f"Error consuming invite code: {e}")
        db.rollback()
        return False
