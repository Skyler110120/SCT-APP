from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user import User, UserRole
from app.schemas.profile import ProfileCreate, ProfileUpdate
from typing import List, Optional

def get_profile(db: Session, user_id: int ) -> Profile:
    """
    Retrieve a profile by user ID
    
    Args:
        db: Database session
        user_id: ID of the user to access the profile
        company_id: Optional company ID for boundary enforcement
    Returns:
        Profile: The profile associated with the user ID
    """
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def create_profile(db: Session, user_id: int, profile_data: ProfileCreate):
    """
    Create a new user profile
    
    Args:
        db: Database session
        user_id: Id of the user to create profile
        profile_data: Data for the new profile
    Returns:
        Profile: The create profile object
    """
        
    profile_dict = profile_data.dict()
    db_profile = Profile(user_id=user_id, **profile_dict)
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return db_profile

def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate, company_id: Optional[int] = None):
    """
    Update an existing profile
    
    Args:
        db: Database session
        user_id: Id of the user to update profile
        profile_data: Data for the profile
        company_id: Optional company ID for boundary enforcement
    Returns: 
        Profile: The updated profile object
    """
        
    db_profile = get_profile(db, user_id)
    if not db_profile:
        return None
    
    update_data = profile_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
        
    db.commit()
    db.refresh(db_profile)
    
    return db_profile

def get_all_instructors(db: Session, company_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    """
    Get all instructor profiles
    
    Args:
        db: Database session
        company_id: Optional company ID for boundary enforcement
        skip: Number of profiles to skip
        limit: Maximum number of profiles to return
        
    Returns: 
        List of instructor profiles
    """
    query = db.query(Profile).join(User).filter(User.role == UserRole.INSTRUCTOR)
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
        
    return query.offset(skip).limit(limit).all()