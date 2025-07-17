from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.schemas.events import EventCreate, EventUpdate, EventRead
from app.services.events_service import (
    create_event,
    get_event,
    get_events_by_company,
    update_event,
    delete_event
)
from app.models.user import User, UserRole
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    event_create: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new event under a company
    
    Admin users can create events for their company
    """
    return create_event(db, current_user, event_create)

@router.get("/{event_id}", response_model=EventRead)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve an event by its ID
    
    Only accessible to user who are are in the company 
    """
    return get_event(db, current_user, event_id)

@router.get("/company/{company_id}", response_model=List[EventRead])
def get_events_by_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all events for a specific company
    
    Only accessible to users who are part of the company
    """
    return get_events_by_company(db, current_user, company_id)

@router.get("/company/{company_id}/time", response_model=List[EventRead], status_code=status.HTTP_200_OK)
def get_events_by_time_range(
    company_id: int,
    start_time: datetime = Query(..., description="Start datetime for filter"),
    end_time: datetime = Query(..., description="End datetime fro filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all events for a company within a specific time range
    
    Only accessible to users who are part of the company
    """
    return get_events_by_time_range(db, current_user, company_id, start_time, end_time)

@router.patch("/{event_id}", response_model=EventRead)
def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing event
    
    Only accessible to admins of the company
    """
    return update_event(db, event_id, event_update, current_user)

@router.delete("/{event_id}", response_model=EventRead)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an event by its ID
    
    Only accessible to admins of the company
    """
    return delete_event(db, event_id, current_user)

