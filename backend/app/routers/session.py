from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.models.session import SessionStatus
from app.schemas.session import (
    SessionOutDetailed, SessionUpdate, AvailabilityCheckResponse, DirectBookingCreate
)
from app.services.session_service import(
    get_session, get_user_sessions, update_session,
    cancel_session, complete_session, get_admin_sessions,
    check_instructor_availability, book_direct_session,
    get_sessions_for_calendar
)

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)

@router.get("/calendar", response_model=List[SessionOutDetailed])
def get_my_calendar_sessions(
    start_date: date = Query(..., description="Start date for calendar"),
    end_date: date = Query(..., description="End date for calendar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sessions for calendar
    """
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    sessions = get_sessions_for_calendar(
        db=db,
        current_user=current_user,
        start_date=start_date,
        end_date=end_date
    )
    
    return sessions

@router.post("/{session_id}/complete", response_model=SessionOutDetailed)
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

   if current_user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
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

@router.get("", response_model=List[SessionOutDetailed])
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
    if current_user.role == UserRole.ADMIN:
        return get_admin_sessions(db, current_user.company_id, status=status[0] if status and len(status) > 0 else None)
        
    if (current_user.role != UserRole.INSTRUCTOR):
        as_instructor = False
        
    return get_user_sessions(db, current_user.id, current_user.company_id, as_student, as_instructor, status)

@router.get("/{session_id}", response_model=SessionOutDetailed)
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
    if current_user.role not in [UserRole.MASTERADMIN, UserRole.ADMIN]:
        if (db_session.student_id != current_user.id and
            db_session.instructor_id != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this session"
            )
        
    return db_session

@router.put("/{session_id}", response_model=SessionOutDetailed)
def update_session_by_id(
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

@router.post("/{session_id}/cancel", response_model=SessionOutDetailed)
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

@router.post("/check-availability", response_model=AvailabilityCheckResponse)
def check_instructor_availability_endpoint(
    instructor_id: int,
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if an instructor is available for a time slot
    """
    availability = check_instructor_availability(
        db=db,
        instructor_id=instructor_id,
        company_id=current_user.company_id,
        start_time=start_time,
        end_time=end_time
    )
    return availability

@router.post("/direct-book", response_model=SessionOutDetailed)
def book_direct_session_endpoint(
    booking_data: DirectBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Directly book a training session
    """
    
    if current_user.role == UserRole.STUDENT:
        student_id = current_user.id
    else:
        if booking_data.student_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST
            )
        student_id = booking_data.student_id
    return book_direct_session(
        db=db,
        instructor_id=booking_data.instructor_id,
        student_id=student_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        title=booking_data.title,
        description=booking_data.description,
        company_id=current_user.company_id
    )
    
