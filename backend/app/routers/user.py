from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import (
    UserOut, UserUpdate, UserWithCompany, UserWithInstructor,
    UserWithStudents, StudentInstructorAssignment
    )
from app.schemas.auth import PasswordUpdate, CompanyJoin
from app.services.user_service import (
    get_user_by_id,
    get_users,
    update_user,
    update_password,
    promote_user,
    join_company,
    get_instructors_by_company,
    get_user_with_instructor,
    get_instructor_with_students,
    assign_student_to_instructor,
    unassign_student_from_instructor
)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/", response_model=List[UserOut])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of users
    
    Regular and Admin users can only see users in their company
    Master admins can see all users across all companies
    """
    
    if current_user.role == UserRole.MASTERADMIN:
        return get_users(db, company_id, skip, limit)
    else:
        return get_users(db, current_user.company_id, skip, limit)
    
@router.get("/{user_id}", response_model=UserWithCompany)
async def read_user(
    user_id: int = Path(..., title="The ID of the user to get"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific user by ID
    
    Regular users can only see themselves
    Admins can see any user in their company
    Master admins can see any user
    """
    
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.role == UserRole.MASTERADMIN:
        return db_user
    elif current_user.role == UserRole.ADMIN and current_user.company_id == db_user.company_id:
        return db_user
    elif current_user.id == user_id:
        return db_user
    else:
        raise HTTPException(status_code=403, detail="Not authorized to access this user")
    
@router.patch("/{user_id}", response_model=UserOut)
async def update_user_details(
    user_id: int = Path(..., title="The ID of the user to update"),
    user_data: UserUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a user's details

    Regular users can only update themselves and cannot change thier role or company
    Admins can update any user in their company
    Master admins can view data and cannot make changes
    """

    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=403, 
            detail="Master admins have read-only access and cannot modify users"
        )
    
    if current_user.role == UserRole.ADMIN and current_user.company_id == db_user.company_id:
        pass
    elif current_user.id == user_id:
        if user_data.role is not None and user_data.role != db_user.role:
            raise HTTPException(status_code=403, detail="Cannot change your own role")
        if user_data.company_id is not None and user_data.company_id != db_user.company_id:
            raise HTTPException(status_code=403, detail="Cannot change your own company")
        if user_data.instructor_id is not None and user_data.instructor_id != db_user.instructor_id:
            raise HTTPException(
                status_code=403, 
                detail="Cannot change your own instructor"
            )
    else:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to update this user"
        )
    
    return update_user(db, user_id, user_data)

@router.post("/{user_id}/password", response_model=dict)
def update_user_password(
    user_id: int = Path(..., title="The ID of the user to update"),
    password_data: PasswordUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    update a user's password
    Users can only update thier own password
    Master admins cannot update any passwords
    """
    
    if current_user.role == UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=403,
            detail="Master admins have read-only access and cannot modify users"
        )
        
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Can only update your own password")
    
    update_password(
        db,
        user_id,
        password_data.current_password,
        password_data.new_password
    )
    
    return {"message": "Password updated successfully"}

@router.get("/instructors/company/{company_id}", response_model=List[UserOut])
async def get_company_instructors(
    company_id: int = Path(..., title="The ID of the company"),
    db: Session = Depends(get_db),
):
    """
    Get all instructors for a company
    
    Students and admins can only access instructors from their company
    """
    try:
        instructors = get_instructors_by_company(db, company_id)
        return instructors
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch instructors"
        )
        
@router.get("/{user_id}/instructor", response_model=UserWithInstructor)
async def get_user_instructor(
    user_id: int = Path(..., title="The ID of the user"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get user with thier instructor information
    
    Users can only access their own info
    Admins can access any user in their company
    """
    if current_user.role == UserRole.ADMIN:
        target_user = get_user_by_id(db, user_id)
        if not target_user or target_user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=403,
                detail="Can only access users in your company"
            )
    elif current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Can only access your own instructor information"
        )
    
    user = get_user_with_instructor(db, user_id)
    if not user: 
        raise HTTPException(
            status_code=404,
            detail="User not found", 
        )
    
    return user;

@router.get("/{instructor_id}/students", response_model=UserWithStudents)
async def get_instructor_students(
    instructor_id: int = Path(..., title="The ID of the instructor"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get instructor with thier students information
    
    Instructors can only access their own students
    Admins can access any instructor's students in their company
    """
    
    if current_user.role == UserRole.ADMIN:
        instructor = get_user_by_id(db, instructor_id)
        if not instructor or instructor.company_id != current_user.company_id:
            raise HTTPException(
                status_code=403,
                detail="Can only access instructors in your company"
            )
    elif current_user.id != instructor_id:
        raise HTTPException(
            status_code=403,
            detail="Can only access your own students"
        )
    
    instructor = get_instructor_with_students(db, instructor_id)
    if not instructor:
        raise HTTPException(
            status_code=404,
            detail="Instructor not found"
        )
    
    return instructor

@router.post("/assign-instructor", response_model=UserOut)
async def assign_student_instructor(
    assignment: StudentInstructorAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assign a student to an instructor
    
    Students can assign themselves to an instructor
    Admins can assign any student in thier company
    """
    
    try:
        updated_student = assign_student_to_instructor(
            db=db,
            student_id=assignment.student_id,
            instructor_id=assignment.instructor_id,
            current_user=current_user
        )
        return updated_student
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to assign instructor"
        )

@router.delete("/{student_id}/instructor", response_model=UserOut)
async def unassign_student_instructor(
    student_id: int = Path(..., title="The ID of the student"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove instructor assignment from student
    
    Only admins can unassign instructors from students
    """
    
    try:
        updated_student = unassign_student_from_instructor(
            db=db,
            student_id=student_id,
            current_user=current_user
        )
        return updated_student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to unassign instructor"
        )