from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import Token
from app.services.user_service import create_user, get_user_by_email
from app.services.auth_service import authenticate_user, create_user_token

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

    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = create_user_token(user)

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_users_me(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Get the current authenticated user
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        Current user's information
    """

    return current_user
