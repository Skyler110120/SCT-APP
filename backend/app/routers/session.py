from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.models.session import SessionStatus
from app.schemas.session import (
    SessionOut, SessionUpdate, AvailabilityCreate,
    BookingCreate
)
from app.services.session_service import(
    get_session, get_user_sessions, get_available_sessions,
    create_availability, book_session, update_session,
    cancel_session, complete_session, get_admin_sessions,
    get_master_admin_sessions
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
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Master admins have read-only access"
        )

    if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can create availability"
        )
    
    result = create_availability(db, availability_data, current_user.company_id)
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
   if current_user.role == UserRole.MASTERADMIN:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="Master admins have read-only access"
       )

   if current_user.role != UserRole.INSTRUCTOR and current_user.role != UserRole.ADMIN:
       raise HTTPException(
           status_code=status.HTTP_403_FORBIDDEN,
           detail="Only instructors can mark sessions as complete"
       )

   result = complete_session(db, session_id, current_user.id, current_user.company_id)
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
    if instructor_id is not None and current_user.role != UserRole.MASTERADMIN:
        instructor = db.query(User).filter(
            User.id == instructor_id,
            User.company_id == current_user.company_id
        ).first()
    
        if not instructor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instructor not found in your company"
            )
    if current_user.role == UserRole.MASTERADMIN:
        return get_available_sessions(db, current_user.company_id, instructor_id)
    
    return get_available_sessions(db, current_user.company_id, instructor_id)

@router.post("/book", response_model=SessionOut)
def book_training_session(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Book an available firearms training session
    """
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Master admins have read-only access"
        )

    if current_user.role != UserRole.ADMIN and booking_data.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can book sessions for other users"
        )
    result = book_session(db, booking_data, current_user.company_id)
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
    current_user: User = Depends(get_current_user),
    status: Optional[List[SessionStatus]] = None
):
    """
    Get all sessions for the current user
    """
    if current_user.role == UserRole.MASTERADMIN:
        return get_master_admin_sessions(db, status=status[0] if status else None)
    
    if current_user.role == UserRole.ADMIN:
        return get_admin_sessions(db, current_user.company_id, status=status[0] if status else None)

    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.INSTRUCTOR:
        as_instructor = False
        
    return get_user_sessions(db, current_user.id, current_user.company_id, as_student, as_instructor, status)

@router.get("/{session_id}", response_model=SessionOut)
def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific session by ID
    """
    if current_user.role == UserRole.MASTERADMIN:
        db_session = get_session(db, session_id)
    else:
        db_session = get_session(db, session_id, current_user.company_id)
        
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found in your company"
        )
    if current_user.role != UserRole.MASTERADMIN and current_user.role != UserRole.ADMIN:
        if db_session.status != SessionStatus.AVAILABLE and db_session.student_id != current_user.id and db_session.instructor_id != current_user.id:
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
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Master admins have read-only access"
        )

    result = update_session(db, session_id, current_user.id, current_user.company_id, session_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found, not in your company, or not authorized to update"
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
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Master admins have read-only access"
        )
        
    result = cancel_session(db, session_id, current_user.id, current_user.company_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found, not in your company, or not authorized to cancel"
        )
        
    return result