from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from typing import List, Optional

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.models.user import User

def get_company_by_id(db: Session, company_id: int) -> Optional[Company]:
    """
    Get a company by ID
    
    Args: 
        db: Database session
        company_id: ID of the company to retrieve
    
    Returns:
        Company object if found, None otherwise
    """
    return db.query(Company).filter(Company.id == company_id).first()

def get_company_by_slug(db: Session, slug: str) -> Optional[Company]:
    """
    Get a company by slug
    
    Args:
        db: Database session
        slug: Slug of the company to retrieve
        
    Returns:
        Company object if found, None otherwise
    """
    return db.query(Company).filter(Company.slug == slug).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> List[Company]:
    """
    Get a list of companies
    
    Args: 
        db: Database session
        skip: Number of companies to skip
        limit: Maximum number of companies to return
        include_inactive: Whether to include inactive companies
        
    Returns:
        List of Company objects
    """
    query = db.query(Company)
    if not include_inactive:
        query = query.filter(Company.is_active == True)
    return query.offset(skip).limit(limit).all()

def get_companies_with_user_count(db: Session, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> List[dict]:
    """
    Get a list of companies with user count
    
    Args:
        db: Database Session
        skip: Number of companies to skip
        limit: Maximum number of companies to return
        include_inactive: Whether to include inactive companies
        
    Returns:
        List of dictionaries containing companies with user count
    """
    query = db.query(
        Company,
        func.count(User.id).label('user_count')
    ).outerJoin(User, Company.id == User.company_id)
    
    if not include_inactive:
        query = query.filter(Company.is_active == True)
        
    result = query.group_by(Company.id).offset(skip). limit(limit).all()
    
    companies_with_count = []
    for company, user_count in result:
        company_dict = {
            **{c.name: getattr(company, c.name) for c in company.__table__.columns},
            'user_count': user_count
        }
        companies_with_count.append(company_dict)
        
    return companies_with_count

def create_company(db: Session, company_data: CompanyCreate) -> Company:
    """
    Create a new company
    
    Args: 
        db: Database session
        company_data: Data for the new company
        
    Returns:
        Newly create company
    Raises:
        HTTPException: If slug already exists
    """
    if company_data.slug:
        existing_company = get_company_by_slug(db, company_data.slug)
        if existing_company:
            raise HTTPException(status_code=400, detail="Company slug already exists")
    
    db_company = Company(**company_data.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, company_id: int, company_data: CompanyUpdate) -> Company:
    """
    Update an existing company
    
    Args:
        db: Database session
        company_id: ID of the company to update
        company_data: Data to update the company
    
    Returns:
        Updated company
        
    Raises:
        HTTPException: If company not found or slug already exists
    """
    db_company = get_company_by_id(db, company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_data.dict(exclude_unset=True, exclude_none=True)
    
    if "slug" in update_data and update_data["slug"] != db_company.slug:
        existing_company = get_company_by_slug(db, update_data["slug"])
        if existing_company:
            raise HTTPException(status_code=400, detail="Company slug already exists")
    
    for key, value in update_data.items():
        setattr(db_company, key, value)
        
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int) -> bool:
    """
    Delete a company (soft delete)
    
    Args:
        db: Database session
        company_id: ID of the company
        
    Returns:
        True if successful
        
    Raises:
        HTTPException: If company not found
    """
    db_company = get_company_by_id(db, company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_company.is_active = False
    db.commit()
    db.refresh(db_company)
    
    return True
        