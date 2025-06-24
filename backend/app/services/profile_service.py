from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileUpdate

def get_profile(db: Session, user_id: int) -> Profile:
    """
    Retrieve a profile by user ID
    
    Args:
        db: Database session
        user_id: ID of the user to access the profile
        
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

def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate):
    """
    Update an existing profile
    
    Args:
        db: Database session
        user_id: Id of the user to update profile
        profile_data: Data for the profile
        
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

def get_all_instructors(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all instructor profiles
    
    Args:
        db: Database session
        skip: Number of profiles to skip
        limit: Maximum number of profiles to return
        
    Returns: 
        List of instructor profiles
    """
    return db.query(Profile).join(User).filter(
        User.role == "instructor"
    ).offset(skip).limit(limit).all()