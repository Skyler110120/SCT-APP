from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException, status
from datetime import datetime

from app.models.events import Event
from app.models.company import Company
from app.models.user import User, UserRole
from app.schemas.events import EventCreate, EventUpdate

def create_event(db: Session, created_by: User, event_create: EventCreate) -> Event: 
    """
    Create a new event under a specific company
    
    Args: 
        db: Database session
        created_by: User who created the event
        event_create: EventCreate schema containing event details
        
    Returns:
        Event object if created successfully
        
    Raises: 
        HTTPException: If the user does not have permission to create the event or the company does not exist
    """
    company = db.query(Company).filter(Company.id == event_create.company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    if created_by.company_id != company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create events for this company"
        ) 
    if created_by.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create events"
        )

    event = Event(
        **event_create.dict(),
        company_id=created_by.company_id,
        created_by_user_id=created_by.id,
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def get_event(db: Session, user: User, event_id: int): 
    """
    Retrieve an event by its ID    
        
    Args: 
        db: Database session
        event_id: ID of the event to retrieve
            
    Returns: 
        Event object if found
        
    Raises: 
        HTTPException: If the event does not exist
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    if user.company_id != event.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this event"
        )
        
    return event

def get_events_by_company(db: Session, user: User, company_id: int):
    """
    Retrieve all events for a specific company
    
    Args: 
        db: Database session
        company_id: ID of the company to retrieve events for
        
    Returns: 
        List of Event objects if found
    
    Raises: 
        HTTPException: If the company does not exist
    """
    company = db.query(Company).filter(Company.id == company_id).first()
   
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    if user.company_id != company.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view events for this company"
        )
        
    return db.query(Event).filter(Event.company_id == company_id).all()

def get_events_by_time_range(
    db: Session, 
    user: User, 
    company_id: int, 
    start_time: datetime,
    end_time: datetime
):
    """
    Retrieve all events for a company within a specific time range
    
    Args:
        db: Database session
        user: User requesting the events
        company_id; ID of the company to retrieve events for 
        start_time: Start of the time range
        end_time: End of the time range
    Returns:
        List of Event objects if found
    Raises:
        HTTPException: If the user does not have permission
    """
    if (user.company_id != company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view events for this company"
        )
        
    return (db.query(Event)
        .filter(Event.company_id == company_id)
        .filter(Event.start_time >= start_time)
        .filter(Event.end_time <= end_time)
        .all()
    )
def update_event(db: Session, event_id: int, event_update: EventUpdate, user: User):
    """
    Update an existing event
    
    Args: 
        db: Database session
        event_id: ID of the event to update
        event_update: EventUpdate schema containing updated event details
        
    Returns:
        Updated Event object if successful
        
    Raises: 
        HTTPException: If the event does not exist or the user does not have permission
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    if user.company_id != event.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update events for this company"
        )
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be an admin to update events"
        )
        
    for field, value in event_update.dict(exclude_unset=True).items():
        setattr(event, field, value)
        
    db.commit()
    db.refresh(event)
    return event

def delete_event(db: Session, event_id: int, user: User):
    """
    Delete an existing event
    
    Args: 
        db: Database session
        event_id: ID of the event to delete
        user: User requesting the deletion
        
    Returns:
        Deleted Event object if successful
        
    Raises:
        HTTPException: If the event does not exist or the user does not have permission
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    if user.company_id != event.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete events for this company"
        )
    if user.role != UserRole.ADMIN: 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be an admin to delete events"
        )
        
    db.delete(event)
    db.commit()
    return event
