from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserUpdate, UserWithCompany
from app.schemas.auth import PasswordUpdate, CompanyJoin
from app.services.user_service import (
    get_user_by_id,
    get_users,
    update_user,
    update_password,
    promote_user,
    join_company
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
    else:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
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