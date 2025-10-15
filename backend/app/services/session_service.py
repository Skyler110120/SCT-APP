from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime, date, timedelta
from sqlalchemy import or_, and_
from typing import Optional, List
from app.models.session import Session as SessionModel, SessionStatus
from app.models.user import User, UserRole
from app.models.student_enrollment import StudentEnrollment
from app.schemas.session import SessionUpdate

def auto_update_overdue_sessions(db: Session, company_id: int):
    """
    Automatically update sessions that are overdue
    - SCHEDULED sessions past end_time -> CANCELLED
    
    Args:
        db: Database session
        company_id: ID of the company
    
    """
    
    now = datetime.now()
    
    overdue_scheduled_sessions = db.query(SessionModel).filter(
        SessionModel.company_id == company_id,
        SessionModel.status == SessionStatus.SCHEDULED,
        SessionModel.end_time < now
    ).all()
    
    cancelled_count = 0
    
    for session in overdue_scheduled_sessions:
        session.status = SessionStatus.CANCELLED
        cancelled_count += 1
        
    if cancelled_count > 0:
        db.commit()
    
    return cancelled_count

def _add_computed_fields(session: SessionModel):
    """
    Add computed fields for consistent frontend experience
    
    Args:
        session: SessionModel with relationships loaded
    """
    if not session:
        return
    
    try:
        if session.instructor:
            session.instructor_name = f"{session.instructor.first_name} {session.instructor.last_name}".strip()
            session.instructor_email = session.instructor.email
            
        if session.student:
            session.student_name = f"{session.student.first_name} {session.student.last_name}".strip()
            session.student_email = session.student.email
            
        if session.company:
            session.company_name = session.company.name
        
        if session.start_time and session.end_time:
            session.duration_minutes = int((session.end_time - session.start_time).total_seconds() / 60)
            
        now = datetime.now()
        
        session.can_be_cancelled = (
            session.status == SessionStatus.SCHEDULED and
            session.start_time > now + timedelta(hours=1)  # Must cancel 1hr in advance
        )
        
        session.can_be_completed = (
            session.status == SessionStatus.IN_PROGRESS
        )
        
        if session.course:  
            session.course_title = session.course.title
            session.course_description = session.course.description
            session.course_gun_type = session.course.required_gun_type
            session.course_difficulty = session.course.difficulty_level
        else:
            session.course_title = session.title
            session.course_description = session.description
        
        if session.enrollment:
            session.enrollment_current_week = session.enrollment.current_week
            session.enrollment_progress_display = session.enrollment.week_display
            session.enrollment_progress_percentage = session.enrollment.progress_percentage
            session.enrollment_status = session.enrollment.status
        
        print(f"Standardized session {session.id}: {session.course_title} - {session.student_name}")
        
    except Exception as e:
        print(f"Error standardizing session {session.id}: {e}")
def get_session(db: Session, session_id: int, company_id: Optional[int] = None):
    """
    Get a session by ID
    
    Args:
        db: Database session
        session_id: ID of the session to retrieve
        company_id: Optional company ID to filter by
    Returns:
        The session if found, None otherwise
    """
    query = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(SessionModel.id == session_id)
    
    if company_id is not None:
        query = query.filter(SessionModel.company_id == company_id)

    session = query.first()
    
    if session:
        _add_computed_fields(session)
    return session

def get_user_sessions(db: Session, user_id: int, company_id: int, as_student: bool = True, as_instructor: bool = True, status: list = None):
    """
    Get sessions for a user, either student, instructor, or both
    
    Args:
        db: Database session
        user_id: ID of the user
        company_id: ID of the company to filter
        as_student: Include sessions where the user is a student
        as_instructor: Include sessions where the user is an instructor
        status: Optional list of sttus to filter by
    Returns: 
        List of sessions
    """
    query = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(SessionModel.company_id == company_id)
    
    filters = []
    if as_student:
        filters.append(SessionModel.student_id == user_id)
    if as_instructor:
        filters.append(SessionModel.instructor_id == user_id)
    if filters:
        query = query.filter(or_(*filters))
        
    if status:
        query = query.filter(SessionModel.status.in_(status))
    else:
        query = query.filter(SessionModel.status.in_([
           SessionStatus.SCHEDULED,
           SessionStatus.IN_PROGRESS,
           SessionStatus.COMPLETED,
           SessionStatus.CANCELLED
        ]))
    
    sessions = query.order_by(SessionModel.start_time).all()
    for session in sessions:
        _add_computed_fields(session)
    return sessions

def update_session(db: Session, session_id: int, user_id: int, company_id: int, session_data: SessionUpdate):
    """
    Update a session
    
    Args: 
        db: Database session
        session_id: ID of the session to update
        user_id: ID of the user updating the session
        company_id: Company ID for validation
        session_data: Validating session data
    """
    db_session = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(
            SessionModel.id == session_id,
            SessionModel.company_id == company_id
        ).first()

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN:
        pass
    elif user.role == UserRole.INSTRUCTOR:
        if db_session.instructor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this session"
            )
    elif user.role == UserRole.STUDENT:
        if db_session.student_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this session"
            )
        
        restricted_fields = {'instructor_id', 'start_time', 'end_time', 'status'}
        update_fields = set(session_data.dict(exclude_unset=True).keys())
        if restricted_fields.intersection(update_fields):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only update title and description"
            )
    session_dict = session_data.dict(exclude_unset=True)
    for key, value in session_dict.items():
        setattr(db_session, key, value)
        
    db.commit()
    db.refresh(db_session)
    
    _add_computed_fields(db_session)
    
    return db_session

def cancel_session(db: Session, session_id: int, user_id: int, company_id: int):
    """
    Cancel a session
    
    Args:
        db: Database session
        session_id: ID of the session to cancel
        user_id: ID of the user requesting cancellation
        company_id: Company ID for validation
    """
    db_session = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(
            SessionModel.id == session_id,
            SessionModel.company_id == company_id
        ).first()

    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != UserRole.ADMIN:
        if db_session.instructor_id != user_id and db_session.student_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to cancel this session"
            )
            
    if db_session.status != SessionStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a session that is not scheduled"
        )
    
    db_session.status = SessionStatus.CANCELLED
    db.commit()
    db.refresh(db_session)
    
    _add_computed_fields(db_session)
    
    return db_session

def complete_session(db: Session, session_id: int, instructor_id: int, company_id: int):
    """
    Mark a session as completed
    
    Args:
        db: Database session
        session_id: ID of the session to complete
        instructor_id: ID of the instructor
        company_id: Company ID for validation
    """
    db_session = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(
            SessionModel.id == session_id,
            SessionModel.company_id == company_id,
            SessionModel.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS])
        ).first()
    
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or already completed"
        )
    
    user = db.query(User).filter(User.id == instructor_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor not found"
        )
    
    if user.role != UserRole.ADMIN and db_session.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to complete this session"
        )

    db_session.status = SessionStatus.COMPLETED
    db.commit()
    db.refresh(db_session)
    
    _add_computed_fields(db_session)
    
    return db_session

def get_admin_sessions(db: Session, company_id: int, status: Optional[SessionStatus] = None):
    """
    Get all sessions in a company (for admin use)
    
    Args:
        db: Database session
        company_id: Company ID to filter by
        status: Optional status to filter by
    """
    query = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment)
        ).filter(SessionModel.company_id == company_id)
    
    if status:
        query = query.filter(SessionModel.status == status)
        
    sessions = query.order_by(SessionModel.start_time).all()
    
    for session in sessions:
        _add_computed_fields(session)
    return sessions

def check_instructor_availability (
    db: Session,
    instructor_id: int,
    company_id: int,
    start_time: datetime,
    end_time: datetime
): 
    """
    Check if an instructor is available for a given time slot
    
    Args: 
        db: Database session
        instructor_id: ID of the instructor
        company_id: ID of the company
        start_time: Start time of the requested slot
        end_time: End time of the requested slot
    """
    conflicts = db.query(SessionModel).filter(
        SessionModel.instructor_id == instructor_id,
        SessionModel.company_id == company_id,
        SessionModel.status == SessionStatus.SCHEDULED,
        or_(
            and_(
                SessionModel.start_time < end_time,
                SessionModel.end_time > start_time
            )
        )
    ).all()
    
    if conflicts:
        return {
            "available": False,
            "conflicts": [
                {
                    "id": conflict.id,
                    "title": conflict.title,
                    "start_time": conflict.start_time.isoformat(),
                    "end_time": conflict.end_time.isoformat(),
                    "status": conflict.status,
                }
                for conflict in conflicts
            ],
            "message": f"Instructo has {len(conflicts)} scheduling conflict{'s' if len(conflicts) > 1 else ''}"
        }
    
    return {
        "available": True,
        "conflicts": [],
        "message": "Instructor is available for this time slot"
    }

def book_direct_session(
    db: Session,
    instructor_id: int,
    student_id: int,
    start_time: datetime,
    end_time: datetime,
    title: str,
    description: str,
    company_id: int
):
    """
    Directly book a session without pre-creating availability
    
    Args:
        db: Database session
        instructor_id: ID of the instructor
        student_id: ID of the student
        start_time: Start time of the session
        end_time: End time of the session
        title: Title of the session
        description: Description of the session
        company_id: ID of the company
    """
    
    instructor = db.query(User).filter(
        User.id == instructor_id,
        User.company_id == company_id,
        User.role == UserRole.INSTRUCTOR
    ).first()
    
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor not found"
        )
        
    student = db.query(User).filter(
        User.id == student_id,
        User.company_id == company_id,
        User.role == UserRole.STUDENT
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    active_enrollment = db.query(StudentEnrollment).options(
        joinedload(StudentEnrollment.course)
    ).filter(
        StudentEnrollment.student_id == student_id,
        StudentEnrollment.status == "active"
    ).first()
        
    course_id = None
    enrollment_id = None
    
    if active_enrollment:
        enrollment_id = active_enrollment.id
        if active_enrollment.course:
            course_id = active_enrollment.course.id
            
            if title.strip().lower() in ['training session', 'session', '']:
                title = active_enrollment.course.title
                print(f"📚 Enhanced title: {title}")
                
            if not description and active_enrollment.course.description:
                description = active_enrollment.course.description
                
    availability_check = check_instructor_availability(
        db, instructor_id, company_id, start_time, end_time
    )
    
    if not availability_check["available"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scheduling conflict: {availability_check['message']}"
        )
    
    session = SessionModel(
        instructor_id=instructor_id,
        student_id=student_id,
        company_id=company_id,
        course_id=course_id,
        enrollment_id=enrollment_id,
        start_time=start_time,
        end_time=end_time,
        title=title,
        description=description,
        status=SessionStatus.SCHEDULED
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    _add_computed_fields(session)
    
    return session

def get_sessions_for_calendar(
    db: Session,
    current_user: User,
    start_date: date,
    end_date: date,
) -> List[SessionModel]:
    """
    Get sessions for a calendar view within a date range
    
    Args:
        db: Database session
        current_user: The user requesting the sessions
        start_date: Start date for the calendar view
        end_date: End date for the calendar view
    Returns:
        List of sessions within the specified date range
    """
    
    try:
        auto_update_overdue_sessions(db, current_user.company_id)
    except Exception as e:
        print(f"Auto-update warning: {e}")
        
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    calendar_statuses = [
        SessionStatus.SCHEDULED,
        SessionStatus.IN_PROGRESS
    ]
    
    query = db.query(SessionModel).options(
            joinedload(SessionModel.student),
            joinedload(SessionModel.instructor),
            joinedload(SessionModel.company),
            joinedload(SessionModel.course),
            joinedload(SessionModel.enrollment).joinedload(StudentEnrollment.course)  # ✅ ADD enrollment loading
        ).filter(
            SessionModel.company_id == current_user.company_id,
            SessionModel.start_time >= start_datetime,
            SessionModel.start_time <= end_datetime,
            SessionModel.status.in_(calendar_statuses)
        )
    
    if current_user.role == UserRole.STUDENT:
        if current_user.instructor_id:
            query = query.filter(SessionModel.instructor_id == current_user.instructor_id)
        else:
            query = query.filter(SessionModel.student_id == current_user.id)
    elif current_user.role == UserRole.INSTRUCTOR:
        query = query.filter(SessionModel.instructor_id == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        pass
        
    sessions = query.order_by(SessionModel.start_time).all()
    
    for session in sessions:
        _add_computed_fields(session)
    return sessions