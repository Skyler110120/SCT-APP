from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime

from app.models.test_session_form import TestSessionForm
from app.models.session import Session as SessionModel, SessionStatus
from app.models.course_drill import CourseDrill, StudentDrillResult
from app.models.user import User, UserRole
from app.schemas.test_session_form import TestSessionFormCreate, TestSessionFormUpdate, TestSessionFormComplete
from app.schemas.course_drill import StudentDrillSummary, StudentDrillResultOut

def create_test_session_form(db: Session, form_data: TestSessionFormCreate, instructor_id: int, company_id: int):
    """
    Creates a new test session form
    
    Args:
        db: database session
        form_data: data for creating the test form
        instructor_id: ID of the instructor creating the test form
        company_id: ID of the comapny the instructor and student are under
    
    Returns:
        The created TestSessionForm Object
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
            detail="You do not have permission to create a form for this session"
        )
    
    if session.status != SessionStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot create form for session with status {session.status}"
        )
    
    existing_form = db.query(TestSessionForm).filter(
        TestSessionForm.session_id == form_data.session_id
    ).first()
    
    if existing_form:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A form already exists for this session"
        )
    
    if not session.enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session must be linked to enrollment"
        )
    
    test_form = TestSessionForm(
        session_id=session.id,
        instructor_id=instructor_id,
        student_id=session.student_id,
        course_id=session.course_id
    )
    
    session.status = SessionStatus.IN_PROGRESS
    
    db.add(test_form)
    db.commit()
    db.refresh(test_form)
    
    return test_form

def update_test_session_form(db: Session, form_id: int, form_data: TestSessionFormUpdate, user_id: int, company_id: int):
    """
    Updates a test session form with answers
    
    Args:
        db: database session
        form_id: ID of the test form to update
        form_data: data for updating the test form with
        user_id: ID of the user updating the test form
        company_id: ID of the company the user is under
    
    Returns:
        The updated TestSessionForm object
    """
    
    test_form = db.query(TestSessionForm).join(SessionModel).filter(
        TestSessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not test_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test form not found"
        )
    
    if test_form.instructor_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this form"
        )
    
    if test_form.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a completed form"
        )
    
    form_dict = form_data.dict(exclude_unset=True, exclude={'drill_updates'})
    for key, value in form_dict.items():
        setattr(test_form, key, value)
        
    if form_data.drill_updates:
        for drill_update in form_data.drill_updates:
            student_result = db.query(StudentDrillResult).filter(
                StudentDrillResult.drill_id == drill_update.drill_id,
                StudentDrillResult.student_id == test_form.student_id
            ).first()
            
            if student_result:
                student_result.current_value = drill_update.current_value
                student_result.passed = drill_update.passed
                student_result.updated_at = datetime.now(datetime.timezone.utc)
            else:
                new_result = StudentDrillResult(
                    drill_id=drill_update.drill_id,
                    student_id=test_form.student_id,
                    current_value=drill_update.current_value,
                    passed=drill_update.passed
                )
                db.add(new_result)
    
    db.commit()
    db.refresh(test_form)
    
    return test_form

def complete_test_session_form(db: Session, form_id: int, form_data: TestSessionFormComplete, instructor_id: int, company_id: int):
    """
    Completes a test session form and advances a student if approved
    
    Args:
        db: database session
        form_id: ID of the test form to complete
        form_data: data for completing the test form
        instructor_id: ID of the instructor completing the test form
        company_id: ID of the company the instructor is under
    
    Returns:
        The completed TestSessionForm object
    """
    
    test_form = db.query(TestSessionForm).options(
        joinedload(TestSessionForm.session).joinedload(SessionModel.enrollment)
    ).join(SessionModel).filter(
        TestSessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not test_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test form not found"
        )
    
    if test_form.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to complete this form"
        )
    
    if test_form.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Form is already completed"
        )
    
    if form_data.drill_updates:
        for drill_update in form_data.drill_updates:
            student_result = db.query(StudentDrillResult).filter(
                StudentDrillResult.drill_id == drill_update.drill_id,
                StudentDrillResult.student_id == test_form.student_id
            ).first()
    
            if student_result:
                student_result.current_value = drill_update.current_value
                student_result.passed = drill_update.passed
                student_result.updated_at = datetime.now(datetime.timezone.utc)
            else:
                new_result = StudentDrillResult(
                    drill_id=drill_update.drill_id,
                    student_id=test_form.student_id,
                    current_value=drill_update.current_value,
                    passed=drill_update.passed
                )
                db.add(new_result)
    
    form_dict = form_data.dict(exclude={'drill_updates'})
    for key, value in form_dict.items():
        setattr(test_form, key, value)
    
    test_form.is_completed = True
    test_form.completed_at = datetime.now(datetime.timezone.utc)
    test_form.session.status = SessionStatus.COMPLETED
    
    if form_data.advance_student and test_form.session.enrollment:
        enrollment = test_form.session.enrollment
        enrollment.current_week += 1
        if enrollment.current_week > 24:
            enrollment.current_week = 24
            enrollment.status = "COMPLETED"
            enrollment.completed_at = datetime.now(datetime.timezone.utc)
    
    db.commit()
    db.refresh(test_form)
    return test_form

def get_test_session_form(db: Session, form_id: int, user_id: int, company_id: int):
    """
    Get a test session form by ID
    
    Args:
        db: database session
        form_id: ID of the form to retrieve
        user_id: ID of the user retrieving the form
        company_id: ID of the company the user is under
    
    Returns:
        The TestSessionForm Object with drill results
    """
    
    test_form = db.query(TestSessionForm).join(SessionModel).filter(
        TestSessionForm.id == form_id,
        SessionModel.company_id == company_id
    ).first()
    
    if not test_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test form not found"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.role == UserRole.INSTRUCTOR:
        if test_form.instructor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this form"
            )
    elif user.role == UserRole.STUDENT:
        if test_form.student_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this form"
            )
            
        if not test_form.is_completed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view completed forms"
            )
    
    drill_summary = _create_student_drill_summary(db, test_form.student_id, test_form.course_id)
    test_form.available_drills = drill_summary
    
    return test_form

def _create_student_drill_summary(db: Session, student_id: int, course_id: int):
    """
    Helper function to create a summary of all drills and students results
    
    Args:
        db: database session
        student_id: ID of the student
        course_id: ID of the course the drills belong to
    
    Returns:
        A List of all sumarized data for drills and student results
    """
    drills = db.query(CourseDrill).filter(
        CourseDrill.course_id == course_id,
        CourseDrill.is_active == True
    ).order_by(CourseDrill.display_order.asc()).all()
    
    student_results = db.query(StudentDrillResult).filter(
        StudentDrillResult.student_id == student_id,
        StudentDrillResult.drill_id.in_([drill.id for drill in drills])
    ).all()
    
    results_lookup = {result.drill_id: result for result in student_results}
    
    drill_results = []
    tested_count = 0
    passed_count = 0
    
    for drill in drills:
        actual_result = results_lookup.get(drill.id)
        
        if actual_result and actual_result.current_value is not None:
            tested_count += 1
            if actual_result.passed:
                passed_count += 1
        
        drill_result_data = StudentDrillResultOut(
            result_id=actual_result.id if actual_result else None,
            drill_id=drill.id,
            student_id=student_id,
            current_value=actual_result.current_value if actual_result else None,
            passed=actual_result.passed if actual_result else None,
            result_created_at=actual_result.created_at if actual_result else None,
            result_updated_at=actual_result.updated_at if actual_result else None,
            drill_name=drill.drill_name,
            drill_type=drill.drill_type,
            standard_value=drill.standard_value,
            standard_unit=drill.standard_unit,
            description=drill.description
        )
        
        drill_results.append(drill_result_data)
        
    summary = StudentDrillSummary(
        student_id=student_id,
        course_id=course_id,
        total_drills=len(drills),
        tested_drills=tested_count,
        passed_drills=passed_count,
        completion_percentage=0.0,
        drill_results=drill_results
    )
    
    return summary

def get_instructor_test_session_forms(db: Session, instructor_id: int, company_id: int):
    """
    Get all test session forms for an instructor
    
    Args:
        db: database session
        instructor_id: ID of the instructor
        company_id: ID of the company the instructor is under
    
    Returns:
        List of instructor's TestSessionForm objects
    """
    test_forms = db.query(TestSessionForm).join(SessionModel).filter(
        TestSessionForm.instructor_id == instructor_id,
        SessionModel.company_id == company_id
    ).order_by(TestSessionForm.created_at.desc()).all()
    return test_forms

def get_student_test_session_forms(db: Session, student_id: int, company_id: int):
    """
    Get all test session forms for a student
    
    Args:
        db: database session
        student_id: ID of the student
        company_id: ID of the company the student is under
        
    Returns:
        List of student's TestSessionForm objects    
    """
    test_forms = db.query(TestSessionForm).join(SessionModel).filter(
        TestSessionForm.student_id == student_id,
        SessionModel.company_id == company_id,
        TestSessionForm.is_completed == True
    ).order_by(TestSessionForm.created_at.desc()).all()
    
    return test_forms