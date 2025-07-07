from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut, CompanyWithUserCount
from app.services.company_service import (
    get_company_by_id,
    get_companies,
    get_companies_with_user_count,
    create_company,
    update_company,
    delete_company
)

router = APIRouter(
    prefix="/companies",
    tags=["companies"]
)

@router.get("/", response_model=List[CompanyOut])
def read_companies(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of companies
    
    Regular users and admins can only see their own company
    Master admins can see all companies
    """
    if current_user.role == UserRole.MASTERADMIN:
        return get_companies(db, skip, limit, include_inactive)
    else:
        if current_user.company_id:
            company = get_company_by_id(db, current_user.company_id)
            return [company] if company else []
        return []
    
@router.get("/with-user-count", response_model=List[CompanyWithUserCount])
def read_companies_with_user_count(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of companies with user count
    only master admins can access this endpoint
    """
    if current_user.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only master admins can access this endpoint"
        )
    return get_companies_with_user_count(db, skip, limit, include_inactive)

@router.get("/{company_id}", response_model=CompanyOut)
def read_company(
    company_id: int = Path(..., title="The ID of the company to get"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific company by ID
    
    Regular users and admins can only see their company
    Master admins can see any company
    """
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    if current_user.role == UserRole.MASTERADMIN or company.id == current_user.company_id:
        return company
    else:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this company"
        )
    
@router.post("/", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_new_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new company
    Only master admins can create companies
    """
    if current_user.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only master admins can create companies"
        )
    return create_company(db, company_data)

@router.patch("/{company_id}", response_model=CompanyOut)
def update_company_details(
    company_id: int = Path(..., title="The ID of the company to update"),
    company_data: CompanyUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing company
    Admins can update their own company
    Master admins can update any company
    """
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    if current_user.role == UserRole.MASTERADMIN:
        pass
    elif current_user.role == UserRole.ADMIN and current_user.company_id == company.id:
        pass
    else: 
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this company"
        )
    return update_company(db, company_id, company_data)

@router.delete("/{company_id}", response_model=dict)
def delete_company_endpoint(
    company_id: int = Path(..., title="The ID of the company to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a company (soft delete)
    Only master admins can delete companies
    """
    if current_user.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only master admins can delete companies"
        )
    delete_company(db, company_id)
    return {"message": "Company deleted successfully"}