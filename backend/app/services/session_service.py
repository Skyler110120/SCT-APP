from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from app.models.session import Session as SessionModel, SessionStatus
from app.models.user import User
from app.schemas.session import BookingCreate, SessionUpdate, AvailabilityCreate

def get_session(db: Session, session_id: int):
    """
    Get a session by ID
    
    Args:
        db (Session): Database session
        session_id: ID of the session to retrieve
        
    Returns:
        The session if found, None otherwise
    """
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()

def get_user_sessions(db: Session, user_id: int, as_student: bool = True, as_instructor: bool = True, status: list = None):
    """
    Get sessions for a user, either student, instructor, or both
    
    Args:
        db (Session): Database session
        user_id: ID of the user
        as_student: Include sessions where the user is a student
        as_instructor: Include sessions where the user is an instructor
        status: Optional list of sttus to filter by
    Returns: 
        List of sessions
    """
    query = db.query(SessionModel)
    
    filters = []
    if as_student:
        filters.append(SessionModel.student_id == user_id)
    if as_instructor:
        filters.append(SessionModel.instructor_id == user_id)
    if filters:
        query = query.filter(or_(*filters))
        
    query = query.filter(SessionModel.status != SessionStatus.AVAILABLE)
    
    return query.order_by(SessionModel.start_time).all()

def get_available_sessions(db: Session, instructor_id: int = None):
    """
    Get available time slots
    
    Args:
        db: Database session
        instructor_id: Optional ID to filter by specific instructor
    """
    query = db.query(SessionModel).filter(SessionModel.status == SessionStatus.AVAILABLE)
    
    if instructor_id:
        query = query.filter(SessionModel.instructor_id == instructor_id)
        
    return query.order_by(SessionModel.start_time).all()

def create_availability(db: Session, instructor_id: int, availability_data: AvailabilityCreate):
    """
    Create an availability time slot for an instructor

    Args:
        db (Session): Database sessin
        instructor_id: ID of the instructor
        availability_data: Data for the available time slot
        
    """
    
    instructor = db.query(User).filter(
        User.id == instructor_id,
        User.role == "instructor"
    ).first()
    
    if not instructor:
        return None
    
    conflicts = db.query(SessionModel).filter(
        SessionModel.instructor_id == instructor_id,
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
      
def book_session(db: Session, session_id: int, student_id: int):
    """
    Book an available session
    
    Args:
        db (Session): Database session
        session_id: ID of the session to book
        student_id: ID of the student booking the session
    """
    
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.status == SessionStatus.AVAILABLE
    ).first()
    
    if not db_session:
        return None
    
    db.session.student_id = student_id
    db_session.status = SessionStatus.SCHEDULED
    
    db.commit()
    db.refresh(db_session)
    return db_session

def update_session(db: Session, session_id: int, user_id: int, session_data: SessionUpdate):
    """
    Update a session
    
    Args: 
        db (Session): Database session
        session_id: ID of the session to update
        user_id: ID of the user updating the session
        session_data: Validating session data
    """
    db_session = get_session(db, session_id)
    
    if not db_session:
        return None
    
    if db_session.status == SessionStatus.AVAILABLE and db_session.instructor_id != user_id.id:
        return None
    
    if db_session.status == SessionStatus.SCHEDULED and db_session.student_id != user_id and db_session.instructor_id != user_id:
        return None
    
    session_dict = session_data.dict(exclude_unset=True)
    for key, value in session_dict.items():
        setattr(db_session, key, value)
        
    db.commit()
    db.refresh(db_session)
    return db_session

def cancel_session(db: Session, session_id: int, user_id: int):
    """
    Cancel a session
    
    Args:
        db (Session): Database session
        session_id: ID of the session to cancel
        user_id: ID of the user rquestion cancellation
    """
    db_session = get_session(db, session_id)
    
    if not db_session:
        return None
    
    if db_session.instructor_id != user_id and db_session.studetn_id != user_id:
        return None
    
    if db_session.status == SessionStatus.AVAILABLE:
        if db_session.instructor_id != user_id:
            return None
        db.delete(db_session)
        db.commit()
        return{"deleted": True}
    
    db_session.status = SessionStatus.CANCELLED
    db.commit()
    db.refresh(db_session)
    return db_session

def complete_session(db: Session, session_id: int, instructor_id: int):
    """
    Mark a session as completed
    
    Args:
        db (Session): Database session
        session_id: ID of the session to complete
        instructor_id: ID of the instructor
    """
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.instructor_id == instructor_id,
        SessionModel.status == SessionStatus.SCHEDULED
    ).first()
    
    if not db_session:
        return None
    
    db_session.status = SessionStatus.COMPLETED
    db.commit()
    db.refresh(db_session)
    return db_session