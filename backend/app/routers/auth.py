from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import Token, TokenResponse
from app.services.user_service import create_user, get_user_by_email, needs_onboarding
from app.services.auth_service import authenticate_user, create_user_token
from app.services.company_service import get_company_by_id
from app.models.user import User, UserRole

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db)
):
    """
    Register a new user in the system
    Args:
        user_data: Validated user data
        db: Database session
    Returns:
        Newly created user information
    Raises:
        HTTPException: If email already exists 
    """

    db_user = get_user_by_email(db, user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = create_user(db, user_data)

    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access token
    Args:
        form_data: OAuth2 password request form
        db: Database session
    Returns:
        JWT access token
    Raises:
        HTTPException: If authentication fails
    """
    try:
        print(f"Login attempt for: {form_data.username}")
        
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
            
        print(f"Authentication successful for: {form_data.username}")
        access_token = create_user_token(user)
        
        try:
            has_completed_onboarding = getattr(user, 'has_completed_onboarding', False)
            onboarding_needed = user.company_id is None or not has_completed_onboarding
        except Exception as e:
            print(f"Error checking onboarding status: {str(e)}")
            onboarding_needed = True 
            
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "needs_onboarding": onboarding_needed,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "company_id": user.company_id
        }
        print("Login successful, returning response")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Login failed with error: {str(e)}")
        print(traceback.format_exc())

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserOut)
def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        Current user's information
    """

    return current_user
