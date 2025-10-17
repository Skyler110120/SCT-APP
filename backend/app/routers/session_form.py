from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.services import session_form_service
from app.schemas.session_form import (
    SessionFormCreate,
    SessionFormUpdate,
    SessionFormComplete,
    SessionFormOut
)

router = APIRouter(
    prefix="/session-forms", 
    tags=["Session Forms"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session_form(
    form_data: SessionFormCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new form when instructor starts a session
    """
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can create sessions"
        )
    
    try:
        session_form = session_form_service.create_session_form(
            db=db,
            form_data=form_data,
            instructor_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return session_form
    except HTTPException as e:
        raise 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the session form"
        )

@router.put("/{form_id}")
async def update_session_form(
    form_id: int,
    form_data: SessionFormUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a session form with student answers
    """
    
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can update session forms"
        )
        
    try:
        session_form = session_form_service.update_session_form(
            db=db,
            form_id=form_id,
            form_data=form_data,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return session_form
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the form"
        )
        
@router.post("/{form_id}/complete", status_code=status.HTTP_200_OK)
async def complete_session_form(
   form_id: int,
   form_data: SessionFormComplete,
   current_user: User = Depends(get_current_user),
   db: Session = Depends(get_db) 
):
    """
    Complete a form and finalize student assessment
    """
    
    if current_user.role not in [UserRole.INSTRUCTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can complete session forms"
        )
    
    try:
        session_form = session_form_service.complete_session_form(
            db=db,
            form_id=form_id,
            form_data=form_data,
            instructor_id=current_user.id,
            company_id=current_user.company_id
        )
        
        return {
            "success": True,
            "message": "Session form completed successfully",
            "form_id": session_form.id,
            "student_advanced": session_form.advance_student,
            "session_completed": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while completing the form"
        )

@router.get("/{form_id}", response_model=SessionFormOut)
async def get_session_form(
  form_id: int,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)  
):
    """
    Get a specific session form by ID
    """
    
    try:
        session_form = session_form_service.get_session_form(
            db=db,
            form_id=form_id,
            user_id=current_user.id,
            company_id=current_user.company_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the form"
        )

@router.get("/my-forms/", response_model=List[SessionFormOut])
async def get_my_session_forms(
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db)  
):
    """
    Get session forms for the current user
    """
    
    try:
        if current_user.role == UserRole.INSTRUCTOR:
            session_forms = session_form_service.get_instructor_session_forms(
                db=db,
                instructor_id=current_user.id,
                company_id=current_user.company_id
            )
        elif current_user.role == UserRole.STUDENT:
            session_forms = session_form_service.get_student_session_forms(
                db=db,
                student_id=current_user.id,
                company_id=current_user.company_id
            )
        else:
            session_forms = []
        
        return session_forms
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the forms"
        )