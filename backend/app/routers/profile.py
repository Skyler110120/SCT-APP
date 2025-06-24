from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
from app.services.profile_service import get_profile, create_profile, update_profile, get_all_instructors

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's profile
    
    if no profile exists, one will be created
    """
    
    profile = get_profile(db, current_user.id)
    if not profile:
        profile = create_profile(db, current_user.id, ProfileCreate())

    return profile

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile
    """
    
    profile = update_profile(db, current_user.id, profile_data)
    if not profile:
        profile = create_profile(db, current_user.id, ProfileCreate())
        
    return profile

@router.get("/{user_id}", response_model=ProfileOut)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a user's profile by user ID
    """
    
    profile = get_profile(db, user_id)
    if not profile:
        raise HTTPException(
            staus_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
        
    return profile

@router.get("/instructors", response_model=List[ProfileOut])
def get_instructors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get a list of all instructors
    """
    return get_all_instructors(db, skip, limit)