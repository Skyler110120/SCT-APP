from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status
from datetime import date, time
from sqlalchemy import or_

from app.models.instructor_availability import InstructorAvailability, AvailabilityStatus
from app.schemas.instructor_availability import (
    InstructorAvailabilityCreate,
    InstructorAvailabilityUpdate
 )
from app.models.user import UserRole, User

def create_availability_service(
    db: Session,
    instructor: User,
    availability_create: InstructorAvailabilityCreate
) -> InstructorAvailability:
    """
    Create availability for an instructor
    
    Args:
        db: Database Session
        instructor: User creating the availability
        availability_create: InstructorAvailabilityCreate schema containing availability details
        
    Returns:
        InstructorAvailabilty object if created successfully
        
    Raises:
        HTTPException: If the user does not have permission to create availability
    """
    if instructor.role != UserRole.INSTRUCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create availability"
        )
        
    availability = InstructorAvailability(
        day_of_week=availability_create.day_of_week,
        start_time=availability_create.start_time,
        end_time=availability_create.end_time,
        start_date=availability_create.start_date,
        end_date=availability_create.end_date,
        status=availability_create.status,
        instructor_id=instructor.id,
        company_id=instructor.company_id
    )
    
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability

def update_availability_service(
    db: Session,
    instructor: User,
    availability_id: int,
    availability_update: InstructorAvailabilityUpdate
) -> InstructorAvailability:
    """
    Update availability for an instructor
    
    Args:
        db: Database Session
        instructor: User updating the availability
        availability_id: ID of the availability to update
        availability_update: InstructorAvailabilityUpdate schema containing updated details
    
    Returns:
        InstructorAvailability object if updated successfully
        
    Raises:
        HTTPException: If the user does not have permission
    """
    availability = db.query(InstructorAvailability).filter(
        InstructorAvailability.id == availability_id,
        InstructorAvailability.instructor_id == instructor.id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    for field, value in availability_update.dict(exclude_unset=True).items():
        setattr(availability, field, value)
    db.commit()
    db.refresh(availability)
    return availability

def list_my_availability_service(
    db: Session,
    instructor: User
) -> List[InstructorAvailability]:
    """
    List availability for an instructor
    
    Args:
        db: Database Session
        instructor: User whose availability is being listed
        
    Returns:
        List of InstructorAvailablity objects
    """
    return db.query(InstructorAvailability).filter(
        InstructorAvailability.instructor_id == instructor.id
    ).all()
    
def list_availability_for_student_service(
    db: Session,
    instructor: User,
    student: User
) -> List[InstructorAvailability]:
    """
    List all availability for an instructor
    
    Args:
        db: Database Session
        instructor: User whose availability is being listed
        student Optional[User]: User requesting the availability
    Returns:
        List of InstructorAvailability objects
    
    Raises:
        HTTPException: If the user does not have permission
    """
   
    if instructor.company_id != student.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this instructor's availability"
        )
    
    return db.query(InstructorAvailability).filter(
        InstructorAvailability.instructor_id == instructor.id,
        InstructorAvailability.status == AvailabilityStatus.AVAILABLE
    ).all()
    
def delete_availability_service(
    db: Session,
    instructor: User,
    availability_id: int 
) -> None:
    """
    Delete availability for an instructor
    
    Args:
        db: Database Session
        instructor: User deleting the availability
        availability_id: ID of the availability to delete
    
    Raises:
        HTTPException: If the user does not have permission or availability not found
    """
    
    availability = db.query(InstructorAvailability).filter(
        InstructorAvailability.id == availability_id,
        InstructorAvailability.instructor_id == instructor.id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    if availability.instructor_id != instructor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own availability"
        )
    
    db.delete(availability)
    db.commit()
    return None

def get_availability_for_calendar_service(
    db: Session,
    instructor: User,
    current_user: User,
    start_date: date,
    end_date: date,
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
) -> List[InstructorAvailability]:
    """
    Get availability in a specific time range 
    
    Args:
        db: Database Session
        instructor: User whose availability is being queried
        start_date: Start date of the range
        end_date: End date of the range
        status: Availability status 
        
    Returns:
        List of InstructorAvailability objects
    """
    availability = db.query(InstructorAvailability).filter(
        InstructorAvailability.instructor_id == instructor.id,
        InstructorAvailability.status == status,
        InstructorAvailability.start_date <= end_date,
        or_(
            InstructorAvailability.end_date.is_(None),
            InstructorAvailability.end_date >= start_date
        )
    )
    return availability.all()

