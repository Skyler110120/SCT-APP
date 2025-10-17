from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.services import test_session_form_service
from app.schemas.test_session_form import (
    TestSessionFormCreate,
    TestSessionFormUpdate,
    TestSessionFormComplete,
    TestSessionFormOut
)

router = APIRouter(
    prefix="/test_session-forms",
    tags=["Test Session Forms"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_test_session_form(
    form_data: TestSessionFormCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new form when instructor starts a test session
    """
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can create test sessions"
        )
        
    try:
        test_form = test_session_form_service.create_test_session_form(
            db=db,
            form_data=form_data,
            instructor_id=current_user.id,
            company_id=current_user.company_id
        )
        return test_form
    except HTTPException as e:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while create the test session form"
        )

@router.patch("{form_id}")
async def update_test_session_form(
    form_id: int,
    form_data: TestSessionFormUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing test session form
    """
    
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can update test session forms"
        )
    
    try:
        test_form = test_session_form_service.update_test_session_form(
            db=db,
            form_id=form_id,
            form_data=form_data,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return test_form
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the test session form"
        )

@router.post("/{form_id}/complete", status_code=status.HTTP_200_OK)
async def complete_test_session_form(
    form_id: int,
    form_data: TestSessionFormComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete a test session form and finalize student assessment
    """
    
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can complete test session forms"
        )
    
    try:
        test_form = test_session_form_service.complete_test_session_form(
            db=db,
            form_id=form_id,
            form_data=form_data,
            instructor_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return {
            "success": True,
            "message": "Test session form completed successfully",
            "form_id": test_form.id,
            "student_advanced": test_form.advance_student,
            "session_completed": True,
            "student_id": test_form.student_id,
            "course_id": test_form.course_id,
            "week_completed": test_form.week_number
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while completing the test form"
        )

@router.get("/{form_id}", response_model=TestSessionFormOut)
async def get_test_session_form(
    form_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific test session form by ID
    """
    
    try:
        test_form = test_session_form_service.get_test_session_form(
            db=db,
            form_id=form_id,
            user_id=current_user.id,
            company_id=current_user.company_id,
        )
        
        return test_form
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the test form"
        )

@router.get("/my-forms/", response_model=List[TestSessionFormOut])
async def get_my_test_session_forms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all test session forms for the current user
    """
    
    try:
        if current_user.role == UserRole.INSTRUCTOR:
            test_forms = test_session_form_service.get_instructor_test_session_forms(
                db=db,
                instructor_id=current_user.id,
                company_id=current_user.company_id
            )
        elif current_user.role == UserRole.STUDENT:
            test_forms = test_session_form_service.get_student_test_session_forms(
                db=db,
                student_id=current_user.id,
                company_id=current_user.company_id
            )
        else:
            test_forms = []
        
        return test_forms
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving test forms"
        )