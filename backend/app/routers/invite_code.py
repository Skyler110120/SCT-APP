from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.invite_code import InviteCodeCreate, InviteCodeOut
from app.services.invite_code_service import create_invite_code, get_invite_codes, get_invite_code_by_code, validate_invite_code
from app.services.company_service import get_company_by_id

router = APIRouter(
    prefix="/companies/{company_id}/invite-codes",
    tags=["invite-codes"]
)

@router.post("", response_model=InviteCodeOut, status_code=status.HTTP_201_CREATED)
def create_company_invite_code(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new invite code for a company
    
    Company admins can create regular invite codes for their company
    Master admins can create admin invite codes for any company
    """
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            deatail="Company not found"
        )
        
    if current_user.role == UserRole.MASTERADMIN:
        pass
    elif current_user.role == UserRole.ADMIN:
        if current_user.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to create invite codes for this company"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create invite codes"
        )
    
    db_invite_code = create_invite_code(
        db=db,
        company_id=company_id,
        created_by_id=current_user.id,
    )
    
    return db_invite_code

@router.get("", response_model=List[InviteCodeOut])
def list_company_invite_codes(
    company_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all invite codes for a company
    
    Only accessibly by company admins or master admins
    """
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    if current_user.role == UserRole.MASTERADMIN:
        pass
    elif current_user.role == UserRole.ADMIN:
        if current_user.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view invite codes for your own company"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view invite codes"
        )
    return get_invite_codes(
        db=db,
        company_id=company_id,
        skip=skip,
        limit=limit
    )

@router.post("/validate", status_code=status.HTTP_200_OK)
def validate_invite_code(
    company_id: int,
    code: str,
    db: Session = Depends(get_db)
): 
    """
    Validate an invite code for a company
    
    This checks if an invite code is valid and whether the user should be promoted to admin
    """
    company_id_from_code, should_be_admin = validate_invite_code(db=db, code=code)
        
    if company_id_from_code is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite code"
        )
    if company_id_from_code != company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite code is not for this company"
        )
    return {
        "valid": True,
        "company_id": company_id_from_code,
        "should_be_admin": should_be_admin
    }
    
        