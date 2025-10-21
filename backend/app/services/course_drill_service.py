from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Optional

from app.models.course_drill import CourseDrill, StudentDrillResult
from app.models.course import Course
from app.models.user import User, UserRole
from app.schemas.course_drill import CourseDrillCreate, CourseDrillUpdate, StudentDrillSummary, StudentDrillResultOut

def create_course_drill(db: Session, drill_data: CourseDrillCreate, user_id: int, company_id:  int):
    """
    Create a new drill for a course
    
    Args:
        db: database session
        drill_data: CourseDrillCreate schema with drill information
        user_id: ID of the user creating the drill
        company_id: ID of company for validation
    
    Returns:
        The created CourseDrill object
    """
    
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id,
        User.role == UserRole.MASTERADMIN
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can create drills"
        )
    
    course = db.query(Course).filter(
        Course.id == drill_data.course_id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
        
    existing_drill = db.query(CourseDrill).filter(
        CourseDrill.course_id == drill_data.course_id,
        CourseDrill.drill_name == drill_data.drill_name,
        CourseDrill.is_active == True
    ).first()
    
    if existing_drill:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Drill '{drill_data.drill_name}' already exists for this course"
        )
    
    new_drill = CourseDrill(
        course_id=drill_data.course_id,
        drill_name=drill_data.drill_name,
        drill_type=drill_data.drill_type,
        standard_value=drill_data.standard_value,
        standard_unit=drill_data.standard_unit,
        display_order=drill_data.display_order,
        description=drill_data.description,
        is_active=True
    )
    
    db.add(new_drill)
    db.commit()
    db.refresh(new_drill)
    
    return new_drill
    
def get_course_drills(db: Session, course_id: int):
    """
    Get the information for all drills in a course
    
    Args:
        db: database session
        course_id: ID of the course to fetch drills for
        
    Returns:
        List of CourseDrill objects
    """
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    drills = db.query(CourseDrill).filter(
        CourseDrill.course_id == course_id,
        CourseDrill.is_active == True
    ).order_by(CourseDrill.display_order).all()
    
    return drills

def delete_course_drill(db: Session, drill_id: int, user_id: int, company_id: int):
    """
    Delete a drill from a course (soft delete)
    
    Args:
        db: database session
        drill_id: ID of the drill to delete
        user_id: ID of the user deleting the drill
        company_id: ID of the company for validation
    
    Returns:
        The deactivated CourseDrill object
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id,
        User.role == UserRole.MASTERADMIN
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can delete drills"
        )
    
    drill = db.query(CourseDrill).filter(
        CourseDrill.id == drill_id,
        CourseDrill.is_active == True
    ).first()
    
    if not drill:
        raise HTTPException(
            CourseDrill.id == drill_id,
            CourseDrill.is_active == True
        ).first()
    
    student_results_count = db.query(StudentDrillResult).filter(
        StudentDrillResult.drill_id == drill_id,
        StudentDrillResult.current_value.isnot(None)
    ).count()
    
    drill.is_active = False
    drill.updated_at = datetime.now(datetime.timezone.utc)
    
    db.commit()
    db.refresh(drill)
    
    return drill

def update_course_drill(db: Session, drill_id: int, drill_data: CourseDrillUpdate, user_id: int, company_id: int):
    """
    Update an existing drill for a course
    
    Args:
        db: database session
        drill_id: ID of the drill to update
        drill_data: CourseDrillUpdate schema with updated drill information
        user_id: ID of the user updating the drill
        company_id: ID of the company for validation
    
    Returns:
        The updated CourseDrill object
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.company_id == company_id,
        User.role == UserRole.MASTERADMIN
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admins can update drills"
        )
    
    drill = db.query(CourseDrill).filter(
        CourseDrill.id == drill_id
    ).first()
    
    if not drill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drill not found"
        )
    
    updated_data = drill_data.dict(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(drill, key, value)
    
    drill.updated_at = datetime.now(datetime.timezone.utc)
    
    db.commit()
    db.refresh(drill)
    
    return drill

def get_student_drill_progress(db: Session, student_id: int, course_id: int, user_id: int, company_id: int) -> StudentDrillSummary:
    """
    Get the drill results for a student
    
    Args:
        db: database session
        student_id: ID of the student whose results to fetch
        course_id: ID of the course to filter drills
        user_id: ID of the user making the request
        company_id: ID of the company for validation
        
    Returns:
        List of StudentDrillResult objects
    """
    user = db.query(User).filter(
        User.id == user_id
    ).first()
    
    if user.role == UserRole.STUDENT:
        if student_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only view their own drill results"
            )
    elif user.role == UserRole.INSTRUCTOR:
        pass
    else:
        student = db.query(User).filter(
            User.id == student_id,
            User.company_id == company_id
        ).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
    available_drills = db.query(CourseDrill).filter(
        CourseDrill.course_id == course_id,
        CourseDrill.is_active == True
    ).order_by(CourseDrill.display_order).all()
    
    if not available_drills:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No drills found for this course"
        )
        
    actual_results = db.query(StudentDrillResult).filter(
        StudentDrillResult.student_id == student_id,
        StudentDrillResult.drill_id.in_([drill.id for drill in available_drills])
    ).all()
    
    results_lookup = {result.drill_id: result for result in actual_results}
    
    drill_result_objects = []
    tested_count = 0
    passed_count = 0
    
    for drill in available_drills:
        actual_result = results_lookup.get(drill.id)
        
        if actual_result and actual_result.current_value is not None:
            tested_count += 1
            if actual_result.passed:
                passed_count += 1
        
        drill_result_obj = StudentDrillResultOut(
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
        
        drill_result_objects.append(drill_result_obj)
        
    summary = StudentDrillSummary(
        student_id=student_id,
        course_id=course_id,
        total_drills=len(available_drills),
        tested_drills=tested_count,
        passed_drills=passed_count,
        completion_percentage=0.0,
        drill_results=drill_result_objects
    )
    
    return summary
