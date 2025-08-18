from sqlalchemy.orm import Session, joinedload 
from fastapi import HTTPException, status
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
    profile = db.query(Profile).options(
        joinedload(Profile.course),
        joinedload(Profile.user)
    ).filter(Profile.user_id == user_id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

def create_registration_profile_data(
    user: User,
    course_id: Optional[int] = None,
) -> ProfileCreate:
    """
    Create profile data for new user during registration
    
    Args:
        user: User object with name and role info
        course_id: Course ID from registration (relationship)
        
    Returns:
        ProfileCreate object with course relationship
    """
    
    if user.role == UserRole.STUDENT and course_id:
        bio = f"Welcome {user.first_name}! You're enrolled and ready to start learning!"
    elif user.role == UserRole.INSTRUCTOR:
        bio = f"Welcome {user.first_name}! Ready to inspire and teach amazing students!"
    elif user.role == UserRole.ADMIN:
        bio = f"Welcome {user.first_name}! You're all set to manage your company's learning experience."
    else:
        bio = f"Welcome {user.first_name}! Please complete your profile to get started."
    
    return ProfileCreate(
        bio=bio,
        phone_number=None,
        date_of_birth=None,
        profile_picture=None,
        course_id=course_id  
    )
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
        
    profile_dict = profile_data.dict(exclude_unset=True)
    email = profile_dict.pop('email', None)
    db_profile = Profile(user_id=user_id, **profile_dict)
    
    db.add(db_profile)
    
    if email:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.email = email
            
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    update_data = profile_data.dict(exclude_unset=True)
    
    email = update_data.pop('email', None)
    if email:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            old_email = user.email
            user.email = email
            print(f"Email updated: {old_email} → {email}")
        else:
            print(f"User not found for user_id: {user_id}")
            
    for key, value in update_data.items():
        old_value = getattr(db_profile, key, None)
        setattr(db_profile, key, value)
        print(f"Updated {key}: {old_value} → {value}")
        
    db.commit()
    fresh_profile = get_profile(db, user_id)
    
    return fresh_profile

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
    query = db.query(Profile).join(User).options(
       joinedload(Profile.course),
       joinedload(Profile.user) 
    ).filter(User.role == UserRole.INSTRUCTOR)
    
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
        
    return query.offset(skip).limit(limit).all()