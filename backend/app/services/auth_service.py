from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import logging


from app.models.user import User, UserRole
from app.models.invite_code import CompanyInviteCode
from app.models.company import Company
from app.utils.password import verify_password
from app.utils.tokens import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

def authenticate_user(
        db: Session, 
        email: str, password: str
    ):
    """
    Verify the user's credentials

    Args:
        db: Database session
        email: User's email
        password: User's password
    Returns:
        The user object if authentication is successful, None otherwise
    """
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user

def create_user_token(user: User):
    """
    Create access token for the user
    Args: 
        user: User object
    Returns:
        JWT access token
    """

    token_data = {
        "sub": str(user.id),
        "role": user.role,
        "company_id": user.company_id
    }

    access_token = create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return access_token

def validate_invite_code(db: Session, code: str):
    """
    Validate the invite code and return the company ID and whether the user should be an admin

    Args:
        db: Database session
        code: Invite code to validate
    Returns:
        Tuple of (company_id, should_be_admin)
    """
    invite_code = db.query(CompanyInviteCode).filter(CompanyInviteCode.code == code).first()
    if not invite_code:
        return None, False

    company = db.query(Company).filter(Company.id == invite_code.company_id).first()
    if not company:
        return None, False

    return company.id, invite_code.should_be_admin
