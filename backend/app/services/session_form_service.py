from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime
from typing import Optional, List

from app.models.session_form import SessionForm
from app.models.session import Session as SessionModel, SessionStatus
from app.models.user import User, UserRole
from app.schemas.session_form import SessionFormCreate, SessionFormUpdate, SessionFormComplete

def create_session_form(db: Session, form_data: SessionFormCreate, instructor_id: int, company_id: int):
    """
        Creates a new session form
        
        Args:
            db: database session
            form_data: data for creating the form
            instructor_id: ID of the instructor creating the form
            company_id: ID of the company the instructor and student are under
        
        Returns:
            The created SessionForm Object
    """
    session = db.query(SessionModel).options(
        joinedload(SessionModel.enrollment)
    ).filter(
        SessionModel.id == form_data.session_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create form for this session"
        )
        
    if session.status != SessionStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot create form for session with status {session.status}"
        )
    
    existing_form = db.query(SessionForm).filter(
        SessionForm.session_id == form_data.session_id
    ).first()
    
    if not session.enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session must be linked to enrollment"
        )
    
    week_number = session.enrollment.current_week
    
    session_form = SessionForm(
        session_id=session.id,
        instructor_id=instructor_id,
        student_id=session.student_id,
        course_id=session.course_id,
        week_number=week_number
    )
    
    session.status = SessionStatus.IN_PROGRESS
    
    db.add(session_form)
    db.commit()
    db.refresh(session_form)
    
    return session_form

def update_session_form(db: Session, form_id: int, form_data: SessionFormUpdate, user_id: int, company_id: int):
    """
        Update session form with answers
        
        Args:
            db: database session
            form_id: ID of the form to update
            form_data: data to update the form with
            user_id: ID of the user updating the forms
            company_id: ID of the company the user is under
        
        Returns:
            The updated SessionForm Object
    """
    
    session_form = db.query(SessionForm).join(SessionModel).filter(
        SessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not session_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session form not found"
        )
    
    if session_form.instructor_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this form"
        )
    
    if session_form.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a completed form"
        )
    
    form_dict = form_data.dict(exclude_unset=True)
    for key, value in form_dict.items():
        setattr(session_form, key, value)
    
    db.commit()
    db.refresh(session_form)
    
    return session_form

def complete_session_form(db: Session, form_id: int, form_data: SessionFormComplete, instructor_id: int, company_id: int):
    """
        Complete a session and advance student if approved
        
        Args:
            db: database session
            form_id: ID of the form to complete
            form_data: data to complete the form with
            instructor_id: ID of the instructor completing the form
            company_id: ID of the company the instructor is under
        Returns:
            The completed SessionForm Object
    """
    
    session_form = db.query(SessionForm).options(
        joinedload(SessionForm.session).joinedload(SessionModel.enrollment)
    ).join(SessionModel).filter(
        SessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not session_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session form not found"
        )
    
    if session_form.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to complete this form"
        )
    
    if session_form.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Form is already completed"
        )
    
    form_dict = form_data.dict()
    for key, value in form_dict.items():
        setattr(session_form, key, value)
    
    session_form.is_completed = True
    session_form.completed_at = datetime.now(datetime.timezone.utc)
    session_form.session.status = SessionStatus.COMPLETED
    
    if form_data.advance_student and session_form.session.enrollment:
        enrollment = session_form.session.enrollment
        enrollment.current_week += 1
        if enrollment.current_week > 24:
            enrollment.current_week = 24
            enrollment.status = "COMPLETED"
            enrollment.completed_at = datetime.now(datetime.timezone.utc)
        enrollment.instructor_decision = "APPROVED"
    
    db.commit()
    db.refresh(session_form)
    return session_form

def get_session_form(db: Session, form_id: int, user_id: int, company_id: int):
    """
        Get a session form by ID
        
        Args:
            db: database session
            form_id: ID of the form to retrieve
            user_id: ID of the user retrieving the form
            company_id: ID of the company the user is under
        
        Returns:
            The SessionForm Object
    """

    session_form = db.query(SessionForm).join(SessionModel).filter(
        SessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not session_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session form not found"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.role == UserRole.INSTRUCTOR:
        if session_form.instructor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this form"
            )
    
    elif user.role == UserRole.STUDENT:
        if session_form.student_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this form"
            )
        if not session_form.is_completed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view completed forms"
            )
    
    return session_form

def get_instructor_session_forms(db: Session, instructor_id: int, company_id: int):
    """
        Get session forms for an instructor
        
        Args:
            db: database session
            instructor_id: ID of the instructor
            company_id: ID of the company the instructor is under
    """
    
    session_forms = db.query(SessionForm).join(SessionModel).filter(
        SessionForm.instructor_id == instructor_id,
        SessionModel.company_id == company_id
    ).order_by(SessionForm.created_at.desc()).all()
    
    return session_forms

def get_student_session_forms(db: Session, student_id: int, company_id: int):
    """
        Get session forms for a student
        
        Args:
            db: database session
            student_id: ID of the student
            company_id: ID of the company the student is under
    """
    
    session_forms = db.query(SessionForm).join(SessionModel).filter(
        SessionForm.student_id == student_id,
        SessionModel.company_id == company_id,
        SessionForm.is_completed == True
    ).order_by(SessionForm.completed_at.desc()).all()

    return session_forms