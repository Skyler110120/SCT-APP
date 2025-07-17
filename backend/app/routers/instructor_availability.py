from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.schemas.instructor_availability import (
    InstructorAvailabilityCreate,
    InstructorAvailabilityUpdate,
    InstructorAvailabilityRead
)
from app.services.instructor_availability import (
    create_availability,
    list_my_availability,
    list_availability_for_student,
    update_availability,
    delete_availability,
    get_availability_for_calendar
)
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/availability",
    tags=["Avaliability"]
)

@router.post("/", response_model=InstructorAvailabilityRead, status_code=status.HTTP_201_CREATED)
def add_availability(
    availability_create: InstructorAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create availability for an instructor
    
    only instructors can create thier own availability
    """
    return create_availability(db, current_user, availability_create)

@router.patch("/{availability_id}", response_model=InstructorAvailabilityRead)
def update_availability_route(
    availability_id: int,
    availability_update: InstructorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update availability for an instructor
    
    only instructors can update their own availability
    """
    return update_availability(db, current_user, availability_id, availability_update)

@router.get("/me", response_model=List[InstructorAvailabilityRead])
def list_my_availability_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List availability for a specific instructor
    """
    return list_my_availability(db, current_user)

"""
Not currently used
"""
@router.get("/instructor/{instructor_id}", response_model=List[InstructorAvailabilityRead])
def list_availability_for_student(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List availability for a specific instructor
    """
    instructor = db.query(User).filter(User.id == instructor_id).first()
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor not found"
        )
    return list_availability_for_student(db, instructor, current_user)

@router.get("/instructor/{instructor_id}/calendar", response_model=List[InstructorAvailabilityRead])
def get_instructor_availability_calendar(
    instructor_id: int,
    start_date: date = Query(..., description="Start date for calendar"),
    end_date: date = Query(..., description="End date for calendar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
): 
    """
    Get availability for an instructor for a calendar view
    """
    instructor = db.query(User).filter(User.id == instructor_id).first() 
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor not found"
        )
        
    return get_availability_for_calendar(
        db=db,
        instructor=instructor,
        current_user=current_user,
        start_date=start_date,
        end_date=end_date,
    )

@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability_route(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete availability for an instructor
    
    only instructors can delete their own availability
    """
    
    delete_availability(db, current_user, availability_id)
    return None
    