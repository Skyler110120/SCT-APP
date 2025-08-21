from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserOut
from app.services.user_service import get_students_by_instructor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/instructors",
    tags=["instructors"],
    dependencies=[Depends(get_current_user)],
)

@router.get("/students", response_model=List[UserOut])
async def get_my_students (
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all students assigned to an instructor
    """
    if current_user.role != UserRole.INSTRUCTOR:
        raise HTTPException(
            status_code=403,
            detail="Only instructors can access student information"
        )
    
    try:
        students = get_students_by_instructor(db, instructor_id=current_user.id)
        return students
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch students. Please try again later."
        )