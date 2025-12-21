from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.models.user import User
from app.utils.tokens import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    """
    Get the current user from the JWT token
    Args: 
        token: JWT token 
        db: Database session
    Returns:
        current user
    Raises:
        HTTPException: If token is invalid or user does not exist
    """
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        print(f"Attempting to decode token: {token[:15]}...")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token decoded successfully. Payload: {payload}")

        user_id = payload.get("sub")
        if user_id is None:
            print("No 'sub' field found in token")
            raise credentials_exception
            
        print(f"User ID from token: {user_id}")
    
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error decoding token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token processing error: {str(e)}"
        )
    
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        
        if user is None:
            print(f"No user found with ID: {user_id}")
            raise credentials_exception
        
        if user.has_completed_onboarding is None:
            print(f"Setting default has_completed_onboarding=False for user {user.id}")
            user.has_completed_onboarding = False
            db.commit()
            
        print(f"User found: {user.email}, onboarding status: {user.has_completed_onboarding}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )