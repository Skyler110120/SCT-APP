from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional
from app.models.session import Session as SessionModel, SessionStatus
from app.models.user import User
from app.schemas.session import BookingCreate, SessionUpdate, AvailabilityCreate

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
    query = db.query(SessionModel).filter(SessionModel.id == session_id)
    
    if company_id is not None:
        query = query.filter(SessionModel.company_id == company_id)

    return query.first()

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
    query = db.query(SessionModel).filter(SessionModel.company_id == company_id)
    
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
        query = query.filter(SessionModel.status != SessionStatus.AVAILABLE)
    
    return query.order_by(SessionModel.start_time).all()

def get_available_sessions(db: Session, company_id: int, instructor_id: int = None):
    """
    Get available time slots
    
    Args:
        db: Database session
        company_id: Company ID to filter by
        instructor_id: Optional ID to filter by specific instructor
    """
    query = db.query(SessionModel).filter(
        SessionModel.status == SessionStatus.AVAILABLE,
        SessionModel.company_id == company_id
    )
    
    if instructor_id:
        query = query.filter(SessionModel.instructor_id == instructor_id)
        
    return query.order_by(SessionModel.start_time).all()

def create_availability(db: Session, availability_data: AvailabilityCreate, company_id: int):
    """
    Create an availability time slot for an instructor

    Args:
        db: Database session
        availability_data: Data for the available time slot
        company_id: ID of the company to filter by
    """
    instructor_id = availability_data.instructor_id
    
    instructor = db.query(User).filter(
        User.id == instructor_id,
        User.company_id == company_id
    ).first()
    
    if not instructor:
        return None
    
    conflicts = db.query(SessionModel).filter(
        SessionModel.instructor_id == instructor_id,
        SessionModel.company_id == company_id,
        SessionModel.status.in_([SessionStatus.AVAILABLE, SessionStatus.SCHEDULED]),
        or_(
            and_(
                SessionModel.start_time <= availability_data.start_time,
                SessionModel.end_time > availability_data.end_time
            ),
            and_(
                SessionModel.start_time < availability_data.end_time,
                SessionModel.end_time >= availability_data.end_time
            ),
            and_(
                SessionModel.start_time >= availability_data.start_time,
                SessionModel.end_time <= availability_data.end_time
            )
        )
    ).first()
    
    if conflicts:
        return None
            
    db_session = SessionModel(
        instructor_id=instructor_id,
        student_id=None,
        company_id=company_id,
        title=availability_data.title,
        description=availability_data.description,
        start_time=availability_data.start_time,
        end_time=availability_data.end_time,
        status=SessionStatus.AVAILABLE
    )
        
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
      
def book_session(db: Session, booking_data: BookingCreate, company_id: int):
    """
    Book an available session
    
    Args:
        db: Database session
        booking_data: Booking data with availablity_id and student_id
        company_id: Company ID for validation
    """
    
    db_session = db.query(SessionModel).filter(
        SessionModel.id == booking_data.availability_id,
        SessionModel.company_id == company_id,
        SessionModel.status == SessionStatus.AVAILABLE
    ).first()
    
    if not db_session:
        return None
    
    student = db.query(User).filter(
        User.id == booking_data.student_id,
        User.company_id == company_id
    ).first()
    
    if not student:
        return None

    db_session.student_id = booking_data.student_id
    db_session.status = SessionStatus.SCHEDULED
    
    db.commit()
    db.refresh(db_session)
    return db_session

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
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.company_id == company_id
    ).first()

    if not db_session:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if user.role == "admin":
        pass
    elif db_session.status == SessionStatus.AVAILABLE and db_session.instructor_id != user_id.id:
        return None
    if db_session.status == SessionStatus.SCHEDULED and db_session.student_id != user_id and db_session.instructor_id != user_id:
        return None
    
    session_dict = session_data.dict(exclude_unset=True)
    for key, value in session_dict.items():
        setattr(db_session, key, value)
        
    db.commit()
    db.refresh(db_session)
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
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.company_id == company_id
    ).first()

    if not db_session:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if user.role == "admin":
        pass
    elif db_session.instructor_id != user_id and db_session.student_id != user_id:
        return None

    if db_session.status == SessionStatus.AVAILABLE:
        if db_session.instructor_id != user_id and user.role != "admin":
            return None
        db.delete(db_session)
        db.commit()
        return{"deleted": True}
    
    db_session.status = SessionStatus.CANCELLED
    db.commit()
    db.refresh(db_session)
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
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.company_id == company_id,
        SessionModel.status == SessionStatus.SCHEDULED
    ).first()
    
    if not db_session:
        return None
    
    user = db.query(User).filer(User.id == instructor_id).first()
    if not user:
        return None
    
    if user.role != "admin" and db_session.instructor_id != instructor_id:
        return None

    db_session.status = SessionStatus.COMPLETED
    db.commit()
    db.refresh(db_session)
    return db_session

def get_admin_sessions(db: Session, company_id: int, status: Optional[SessionStatus] = None):
    """
    Get all sessions in a company (for admin use)
    
    Args:
        db: Database session
        company_id: Company ID to filter by
        status: Optional status to filter by
    """
    query = db.query(SessionModel).filter(SessionModel.company_id == company_id)
    
    if status:
        query = query.filter(SessionModel.status == status)
        
    return query.order_by(SessionModel.start_time).all()

def get_master_admin_sessions(db: Session, company_id: Optional[int] = None, status: Optional[SessionStatus] = None):
    """
    Get sessions across companies (for master admin use)
    
    Args:
        db: Database session
        company_id: Optional company ID to filter by
        status: Optional status to filter by
    """
    query = db.query(SessionModel)
    
    if company_id:
        query = query.filter(SessionModel.company_id == company_id)
        
    if status:
        query = query.filter(SessionModel.status == status)
        
    return query.order_by(SessionModel.start_time).all()