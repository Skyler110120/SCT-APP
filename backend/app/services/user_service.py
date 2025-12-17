from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import Optional, List

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.utils.password import hash_password, verify_password
import logging

logger = logging.getLogger(__name__)

def get_user_by_email(db: Session, email: str):
    """
    Gets user by email
    Args:
        db: Database session
        email: Email attached to user
    Returns:
        User object if founnd, None otherwise
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> User:
    """
    Get a user by their ID
    Args:
        db: Database session
        user_id: ID of the user to retrieve
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: UserCreate):
    """
    Create a new user in the database
    Args:
        db: Database session
        user_data: Validated user data
    Returns:
        Newly created user
    """

    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_data.instructor_id:
        if user_data.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=400,
                detail="Instructor ID can only be set for students"
            )
            
        instructor = get_user_by_id(db, user_data.instructor_id)
        if not instructor:
            raise HTTPException(
                status_code=400,
                detail="Instructor not found"
            )
    
        if instructor.role != UserRole.INSTRUCTOR:
            raise HTTPException(
                status_code=400,
                detail="Selected user is not an instructor"
            )
            
        if instructor.company_id != user_data.company_id:
            raise HTTPException(
                status_code=400,
                detail="Instructor must be in the same company"
            )
    
    hashed_password = hash_password(user_data.password)
    
    user_dict = user_data.dict(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    
    db_user = User(**user_dict)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    if db_user.instructor_id:
        logger.info(f"Student {db_user.id} assigned to instructor {db_user.instructor_id}")

    return db_user

def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User:
    """
    Update an existing user with the provided data
    Only updates fields that are provided
    
    Args: 
        db: Database session
        user_id: ID of the user to update
        user_data: Validated user Update data
        
    Returns:
        Updated user object
        
    Raises: 
        HTTPException: If user not found or email already exists
    """
    
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.dict(exclude_unset=True, exclude_none=True)

    if update_data.get("email") and update_data.get("email") != db_user.email:
        existing_user = get_user_by_email(db, update_data["email"])
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    if "role" in update_data:
        new_role = update_data["role"]
        
        if new_role != UserRole.STUDENT and db_user.instructor_id is not None:
            update_data["instructor_id"] = None
            logger.info(f"Cleared instructor assignment for user {user_id} due to role promotion to {new_role}")
    
    if "instructor_id" in update_data:
        instructor_id = update_data["instructor_id"]
        
        if instructor_id is not None:  
            final_role = update_data.get("role", db_user.role)
            
            if final_role != UserRole.STUDENT:
                raise HTTPException(
                    status_code=400,
                    detail="Only students can be assigned to an instructor"
                )
            
            instructor = get_user_by_id(db, instructor_id)
            if not instructor: 
                raise HTTPException(
                    status_code=400,
                    detail="Instructor not found"
                )
            
            if instructor.role != UserRole.INSTRUCTOR:
                raise HTTPException(
                    status_code=400,
                    detail="Selected user is not an instructor"
                )
            
            final_company_id = update_data.get("company_id", db_user.company_id)
            if instructor.company_id != final_company_id:
                raise HTTPException(
                    status_code=400,
                    detail="Instructor must be in the same company"
                )
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def get_users(db: Session, company_id: int = None, skip: int = 0, limit: int = 100):
    """
    Get a list of users, optionally filtered by company
    
    Args:
        db: Database session
        company_id: Optional company ID to filter by
        skip: Number of records to skip
        limit: Maximum number of records to return
    Returns:
        List of UserOut objects
    """
    query = db.query(User)
    
    if company_id is not None:
        query = query.filter(User.company_id == company_id)
        
    return query.offset(skip).limit(limit).all()

def update_password(db: Session, user_id: int, current_password: str, new_password: str):
    """
    Update a user's password after verifying the current password
    
    Args:
        db: Database session
        user_id: ID of the user
        current_password Current password for verification
        new_password: New password to set
        
    Returns:
        True if successful
   
    Raises:
        HTTPException: if user not found or current password is incorrect
    """
    
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    db_user.hashed_password = hash_password(new_password)
    db_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    return True

def join_company(db: Session, user_id: int, company_id: int, make_admin: bool = False):
    """
    Add a user to a company, with option to make them an admin
    
    Args:
        db: Database session
        user_id: ID of the user
        company_id: ID of the company to join
        make_admin: Whether to make the user an admin (for first user)
    Returns:
        Updated User
    Raises:
        HTTPException: If user not found or already in a company
    """ 
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.company_id is not None:
        raise HTTPException(status_code=400, detail="User already belongs to a company")
    
    db_user.company_id = company_id
    
    if make_admin:
        db_user.role = UserRole.ADMIN
    
    db_user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

def promote_user(db: Session, user_id: int, new_role: UserRole, admin_user: User) -> User:
    """
    Promote a user to a different role
    
    Args: 
        db: Database session
        user_id: ID of the user to promote
        new_role: New role to assign
        admin_user: User making the change (must be admin)
    Returns:
        The updated user
    Raises:
        HTTPException: If not authorized or user not found
    """
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if admin_user.role != UserRole.ADMIN or admin_user.company_id != user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to promote user")
    
    if new_role == UserRole.MASTERADMIN:
        raise HTTPException(status_code=400, detail="Cannot promote users to MasterAdmin")
    
    old_role = user.role
    if old_role == UserRole.STUDENT and new_role != UserRole.STUDENT:
        if user.instructor_id is not None:
            user.instructor_id = None
            logger.info(f"Cleared instructor assignment for user {user_id} due to promotion")
    
    user.role = new_role
    user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(user)
    
    logger.infor(f"User {user_id} promoted from {old_role} to {new_role}")
    return user

def needs_onboarding(db: Session, user_id: int) -> bool:
    """
    Check if a user needs to complete onboarding
    
    Args:
        db: Database session
        user_id: ID of the user to check
    Returns:
        True if the user needs to complete onboarding, False otherwise
    """
    
    user = get_user_by_id(db, user_id)
    
    if not user:
        return False
    
    return user.company_id is None or not user.has_completed_onboarding

def get_instructors_by_company(db: Session, company_id: int) -> List[User]:
    """
    Get all instructors in a company
    
    Args: 
        db: Database session
        company_id: ID of the company
    Returns:
        List of instructors in the company
    """
    
    return db.query(User).filter(
        User.company_id == company_id,
        User.role == UserRole.INSTRUCTOR,
        User.is_active == True
    ).all()

def get_students_by_instructor(db: Session, instructor_id: int) -> List[User]:
    """
    Get all students assigned to an instructor
    
    Args:
        db: Database session
        instructor_id: ID of the instructor
    Returns:
        List of students assigned to the instructor
    """
    try:
        students = db.query(User).filter(
            User.instructor_id == instructor_id,
            User.role == UserRole.STUDENT,
            User.is_active == True
        ).all()
        return students
    except Exception as e:
        return []
    
def get_user_with_instructor(db: Session, user_id: int) -> Optional[UserOut]:
    """
    Get a user along with their instructor information loaded
    
    Args: 
        db: Database session
        user_id: ID of the user to retrieve
    Returns:
        User object with instructor relationship loaded
    """
    
    return db.query(User).options(
        joinedload(User.instructor)
    ).filter(User.id == user_id).first()

def get_instructor_with_students(db: Session, instructor_id: int) -> Optional[User]:
    """
    Get an instructor with their students loaded
    
    Args:
        db: Database session
        instructor_id: ID of the instructor to retrieve
    Returns:
        Instructor object with students relationship loaded
    """
    
    return db.query(User).options(
        joinedload(User.students)
    ).filter(
        User.id == instructor_id,
        User.role == UserRole.INSTRUCTOR,
        User.is_active == True
    ).first()
    
def assign_student_to_instructor(db: Session, student_id: int, instructor_id: int, current_user: User) -> User:
    """
    Assign a student to an instructor
    
    Args:
        db: Database session
        student_id: ID of the student to assign
        instructor_id: ID of the instructor to assign to
        current_user: User making the assignment
    Returns: 
        Updated student object
    Raises:
        ValueError: If assignment is invalid
        HTTPException: If not authorized
    """
    
    if current_user.role not in [UserRole.ADMIN]:
        if current_user.id != student_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to assign instructor"
            )
    
    student = get_user_by_id(db, student_id)
    if not student:
        raise ValueError("Student not found")
    
    if student.role != UserRole.STUDENT:
        raise ValueError("User is not a student")
    
    instructor = get_user_by_id(db, instructor_id)
    if not instructor:
        raise ValueError("Instructor not found")
    
    if instructor.role != UserRole.INSTRUCTOR:
        raise ValueError("User is not an instructor")
    
    if student.company_id != instructor.company_id:
        raise ValueError("Instructor must be from the same company as student")
    
    if current_user.role == UserRole.ADMIN:
        if current_user.company_id != student.company_id:
            raise HTTPException(
                status_code=403,
                detail="Can only assign students in your company"
            )
    
    try:
        student.instructor_id = instructor_id
        student.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(student)
        
        logger.info(f"Student {student_id} assigned to instructor {instructor_id} by user {current_user.id}")
        return student
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning student to instructor: {e}")
        raise ValueError("Failed to assign instructor")

def unassign_student_from_instructor(db: Session, student_id: int, current_user: User) -> User:
    """
    Remove instructor assignment from a student
    
    Args:
        db: Database session
        student_id: ID of the student to unassign
        current_user: User making the change
    Returns:
        Update student object with instructor assignment cleared
    Raises:
        HTTPException: If not authorized or student not found
    """
    
    if current_user.role not in [UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only admins can unassign instructors"
        )
    
    student = get_user_by_id(db, student_id)
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )
    
    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=400,
            detail="User is not a student"
        )
    
    if current_user.role == UserRole.ADMIN:
        if current_user.company_id != student.company_id:
            raise HTTPException(
                status_code=403,
                detail="Can only modify students in your company"
            )
            
    try:
        old_instructor_id = student.instructor_id
        student.instructor_id = None
        student.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(student)
        
        logger.info(f"Student {student_id} unassigned from instructor {old_instructor_id} by user {current_user.id}")
        return student
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error unassigning student: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to unassign instructor"
        )