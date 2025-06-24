from unittest import result
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.session import SessionStatus
from app.schemas.session import (
    SessionOut, SessionUpdate, AvailabilityCreate,
    BookingCreate
)
from app.services.session_service import(
    get_session, get_user_sessions, get_available_sessions,
    create_availability, book_session, update_session,
    cancel_session, complete_session
)

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)

@router.post("/availability", response_model=SessionOut)
def create_availablity(
    availability_data: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create an available time slot for firearms training
    """
    if current_user.role != "instructor" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can create availability"
        )
    
    result = create_availability(db, current_user.id, availability_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create availability, time conflict exists"
        )
    return result

@router.post("/{session_id}/complete", response_model=SessionOut)
def mark_session_complete(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
   """
   Mark a session as complete
   """
   
   if current_user.role != "instructor" and current_user.role != "admin":
         raise HTTPException(
              status_code=status.HTTP_403_FORBIDDEN,
              detail="Only instructors can mark sessions as complete"
         )
         
   result = complete_session(db, session_id, current_user.id)
   if not result:
       raise HTTPException(
           status_code=status.HTTP_404_NOT_FOUND,
           detail="Session not found or already completed"
       )
   return result

@router.get("/available", response_model=List[SessionOut])
def get_available_training_slots(
    instructor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get available time slots for firearms training
    """
    return get_available_sessions(db, instructor_id)

@router.post("/book", response_model=SessionOut)
def book_training_session(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Book an available firearms training session
    """
    
    result = book_session(db, booking_data, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session not available for booking"
        )
        
    return result

@router.get("", response_model=List[SessionOut])
def get_my_sessions(
    as_student: bool = True,
    as_instructor: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all sessions for the current user
    """
    if current_user.role != "admin" and current_user.role != "instructor": 
        as_instructor = False
        
    return get_user_sessions(db, current_user.id, as_student, as_instructor)

@router.get("/{session_id}", response_model=SessionOut)
def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific session by ID
    """
    db_session = get_session(db, session_id)
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    if db_session.status != SessionStatus.AVAILABLE and db_session.student_id != current_user.id and db_session.instructor_id != current_user.id and current_user.role != "admin" and current_user.role != "master_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
        
    return db_session

@router.put("/{session_id}", response_model=SessionOut)
def updated_session_by_id(
    session_id: int,
    session_data: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a specific session by ID
    """
    result = update_session(db, session_id, current_user.id, session_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or not authorized to update"
        )
        
    return result

@router.post("/{session_id}/cancel", response_model=SessionOut)
def cancel_session_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a session by ID
    """
    result = cancel_session(db, session_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or not authorized to cancel"
        )
        
    return result