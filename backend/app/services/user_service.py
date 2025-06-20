from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut
from app.utils.password import hash_password

def get_user_by_email(db: Session, email: str):
    """
    Gets user by email
    Args:
        db: Database session
        email: Email attached to user
    Returns:
        User object if founnd, None otherwise
    """
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_data: UserCreate):
    """
    Create a new user in the database
    Args:
        db: Database session
        user_data: Validated user data
    Returns:
        Newly created user
    """

    hashed_password = hash_password(user_data.password)

    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role 
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user