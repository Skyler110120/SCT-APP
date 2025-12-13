from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.services import course_drill_service
from app.schemas.course_drill import (
    CourseDrillCreate,
    CourseDrillUpdate,
    CourseDrillOut,
    StudentDrillSummary
)

router = APIRouter(
    prefix="/course-drills",
    tags=["Course Drills"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_course_drill(
    drill_data: CourseDrillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new drill for a course    
    """
    
    if current_user.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can create drills"
        )
    
    try:
        drill = course_drill_service.create_course_drill(
            db=db,
            drill_data=drill_data,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return drill
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the drill"
        )

@router.delete("/{drill_id}")
async def delete_course_drill(
    drill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete a drill from a course
    """
    
    if current_user.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can delete drills"
        )
    
    try:
        drill= course_drill_service.delete_course_drill(
            db=db,
            drill_id=drill_id,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return {
            "success": True,
            "message": f"Drill '{drill.drill_name}' has been deleted successfully",
            "drill_id": drill.id,
            "drill_name": drill.drill_name
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the drill"
        )
    
@router.get("/course/{course_id}", response_model=List[CourseDrillOut])
async def get_course_drills(
    course_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all drills for a course
    """
    
    try:
        drills = course_drill_service.get_course_drills(
            db=db,
            course_id=course_id
        )
        
        return drills
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving drills for course"
        )

@router.patch("/{drill_id}")
async def update_course_drill(
    drill_id: int,
    drill_data: CourseDrillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing drill for a course
    """
    
    if current_user.role not in [UserRole.MASTERADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can update drills"
        )
    
    try:
        
        drill = course_drill_service.update_course_drill(
            db=db,
            drill_id=drill_id,
            drill_data=drill_data,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return drill
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the drill"
        )

@router.get("/student/{student_id}/course/{course_id}/progress")
async def get_student_drill_progress(
    student_id: int,
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete drill progress for a specific student in a course
    """
    
    try:
        progress = course_drill_service.get_student_drill_progress(
            db=db,
            student_id=student_id,
            course_id=course_id,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return progress
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving student drill progress"
        )

@router.get("/my-progress/course/{course_id}", response_model=StudentDrillSummary)
async def get_my_drill_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's drill progress for a course
    """
    
    try:
        progress = course_drill_service.get_student_drill_progress(
            db=db,
            student_id=current_user.id,
            course_id=course_id,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return progress
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving your drill progress"
        )