from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import Optional, List

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.utils.password import hash_password, verify_password

def get_user_by_email(db: Session, email: str):
    """
    Gets user by email
    Args:
        db: Database session
        email: Email attached to user
    Returns:
        User object if founnd, None otherwise
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """
    Get a user by their ID
    Args:
        db: Database session
        user_id: ID of the user to retrieve
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: UserCreate):
    """
    Create a new user in the database
    Args:
        db: Database session
        user_data: Validated user data
    Returns:
        Newly created user
    """

    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user_data.password)

    role = getattr(user_data, 'role', UserRole.STUDENT)
    
    user_dict = user_data.dict(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    
    db_user = User(**user_dict)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User:
    """
    Update an existing user with the provided data
    Only updates fields that are provided
    
    Args: 
        db: Database session
        user_id: ID of the user to update
        user_data: Validated user Update data
        
    Returns:
        Updated user object
        
    Raises: 
        HTTPException: If user not found or email already exists
    """
    
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.dict(exclude_unset=True, exclude_none=True)
    
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_user = get_user_by_email(db, update_data["email"])
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db_user.updated_at = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(db_user)
    
    return db_user

def get_users(db: Session, company_id: int = None, skip: int = 0, limit: int = 100):
    """
    Get a list of users, optionally filtered by company
    
    Args:
        db: Database session
        company_id: Optional company ID to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
    Returns:
        List of UserOut objects
    """
    query = db.query(User)
    
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
        
    return query.offset(skip).limit(limit).all()

def update_password(db: Session, user_id: int, current_password: str, new_password: str):
    """
    Update a user's password after verifying the current password
    
    Args:
        db: Database session
        user_id: ID of the user
        current_password Current password for verification
        new_password: New password to set
        
    Returns:
        True if successful
   
    Raises:
        HTTPException: if user not found or current password is incorrect
    """
    
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    db_user.hashed_password = hash_password(new_password)
    db_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return True

def join_company(db: Session, user_id: int, company_id: int, make_admin: bool = False):
    """
    Add a user to a company, with option to make them an admin
    
    Args:
        db: Database session
        user_id: ID of the user
        company_id: ID of the company to join
        make_admin: Whether to make the user an admin (for first user)
    Returns:
        Updated User
    Raises:
        HTTPException: If user not found or already in a company
    """ 
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.company_id is not None:
        raise HTTPException(status_code=400, detail="User already belongs to a company")
    
    db_user.company_id = company_id
    
    if make_admin:
        db_user.role = UserRole.ADMIN
    
    db_user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

def promote_user(db: Session, user_id: int, new_role: UserRole, admin_user: User) -> User:
    """
    Promote a user to a different role
    
    Args: 
        db: Database session
        user_id: ID of the user to promote
        new_role: New role to assign
        admin_user: User making the change (must be admin)
    Returns:
        The updated user
    Raises:
        HTTPException: If not authorized or user not found
    """
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if admin_user.role != UserRole.ADMIN or admin_user.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to promote user")
    
    if new_role == UserRole.MASTERADMIN:
        raise HTTPException(status_code=400, detail="Cannot promote users to MasterAdmin")
    
    user.role = new_role
    user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(user)
    
    return user

def needs_onboarding(db: Session, user_id: int) -> bool:
    """
    Check if a user needs to complete onboarding
    
    Args:
        db: Database session
        user_id: ID of the user to check
    Returns:
        True if the user needs to complete onboarding, False otherwise
    """
    
    user = get_user_by_id(db, user_id)
    
    if not user:
        return False
    
    return user.company_id is None or not user.has_completed_onboarding