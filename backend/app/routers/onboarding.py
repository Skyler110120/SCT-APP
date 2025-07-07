from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.invite_code_service import validate_invite_code
from app.services.user_service import join_company

router = APIRouter(
    prefix="/onboarding",
    tags=["onboarding"]
)

@router.post("/complete", status_code=status.HTTP_200_OK)
def complete_onboarding(
    code: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete the onboarding process for a user
    
    This endpoint is called when a user enters an invite code after their first login.
    It validates the code and assigns the user to the approprotiate company and role 
    """
    if current_user.company_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has already completed onboarding"
        )
    
    company_id, should_be_admin = validate_invite_code(db=db, code=code)
    
    if company_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite code"
        )
    
    updated_user = join_company(
        db=db,
        user_id=current_user.id,
        company_id=company_id,
        make_admin=should_be_admin
    )
    
    setattr(updated_user, 'has_completed_onboarding', True)
    db.commit()
    
    return {
        "message": "Onboarding completed successfully",
        "company_id": updated_user.company_id,
        "role": updated_user.role
    }