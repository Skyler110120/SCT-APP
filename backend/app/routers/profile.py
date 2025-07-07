from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
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
    try:
        profile = get_profile(db, current_user.id)
        if not profile:
            profile = create_profile(db, current_user.id, ProfileCreate())
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving profile: {str(e)}"
        )

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile
    """
    try:
        profile = get_profile(db, current_user.id)
        if not profile:
            profile = create_profile(db, current_user.id, profile_data)
        else:
            profile = update_profile(db, profile.id, profile_data)
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.get("/{user_id}", response_model=ProfileOut)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a user's profile by user ID
    """
    try: 
        if current_user.role == UserRole.MASTERADMIN:
            pass
        else:
            target_user = db.query(User).filter(User.id == user_id).first()
            if not target_user or (target_user.company_id != current_user.company_id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found or not in your company"
                )
        profile = get_profile(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving profile: {str(e)}"
        )

@router.get("/instructors", response_model=List[ProfileOut])
def get_instructors(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a list of all instructors
    """
    try:
        if current_user.role == UserRole.MASTERADMIN:
            return get_all_instructors(db, skip=skip, limit=limit)
        else:
            return get_all_instructors(db, company_id=current_user.company_id, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving instructors: {str(e)}"
        )