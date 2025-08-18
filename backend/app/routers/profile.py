from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.models.student_enrollment import StudentEnrollment
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
from app.services.profile_service import get_profile, create_profile, update_profile, get_all_instructors, create_registration_profile_data

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
        try:
            profile = get_profile(db, current_user.id)
            
            print(f"🔍 Profile loaded: ID={profile.id}, user_id={profile.user_id}")
            print(f"🔍 User data: {profile.user.first_name if profile.user else 'None'} ({profile.user.email if profile.user else 'None'})")
            print(f"🔍 Course data: {profile.course.title if profile.course else 'None'} (ID: {profile.course_id})")
            
            return profile
        except HTTPException as e:
            if e.status_code == status.HTTP_404_NOT_FOUND:
                print(f"No profile found for user {current_user.id}, creating default profile...")

                course_id = None
                if current_user.role == UserRole.STUDENT:
                    enrollment = db.query(StudentEnrollment).filter(
                        StudentEnrollment.student_id == current_user.id,
                        StudentEnrollment.status == "active"
                    ).first()
                    
                    if enrollment:
                        course_id = enrollment.course_id
                        print(f"Found active enrollment for student {current_user.id}: course {course_id}")
                    else:
                        print(f"No active enrollment found for student {current_user.id}")
                else:
                    print(f"User {current_user.id} is {current_user.role}, no course assignment needed")
                profile_data = create_registration_profile_data(
                    user=current_user,
                    course_id=course_id
                )
                profile = create_profile(db, current_user.id, profile_data)
                print(f"✅ Auto-created profile for existing user: {current_user.email}")
                return profile
            else:
                raise
                
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
            profile = update_profile(db, current_user.id, profile_data)
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
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
        if current_user.role != UserRole.MASTERADMIN:
            target_user = db.query(User).filter(User.id == user_id).first()
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            access_allowed = (
                target_user.company_id == current_user.company_id or
                current_user.instructor_id == target_user.id or
                target_user.instructor_id == current_user.id
            )
            if not access_allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: User not in your company or not your student/instructor"
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
