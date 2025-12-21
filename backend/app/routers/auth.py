from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import (
    Token, 
    UserInfo,
    RegisterRequest,
    InviteCodeValidation,
    InviteCodeInfo
)
from app.services.user_service import (
    create_user, 
    get_user_by_email, 
    get_user_by_id,
)
from app.services.profile_service import create_profile, create_registration_profile_data
from app.services.auth_service import authenticate_user, create_user_token
from app.services.company_service import get_company_by_id
from app.services.invite_code_service import (
    validate_invite_code_info,
    consume_invite_code,
)
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.student_enrollment import StudentEnrollment, EnrollmentStatus

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def _calculate_onboarding_status(user: User) -> tuple[bool, bool]:
    """
    Calculate onboarding status for a user
    
    Args:
        user: User object
        
    Returns: 
        Tuple of (needs_onboarding, has_completed_onboarding)
    """
    try:
        if user.role == UserRole.MASTERADMIN:
            logger.debug(f"User {user.id} is MasterAdmin - skipping all onboarding")
            return False, True
        
        has_completed_onboarding = getattr(user, 'has_completed_onboarding', False)
        has_company = user.company_id is not None
        
        needs_instructor_assignment = (
            user.role == UserRole.STUDENT and
            has_company and
            getattr(user, 'instructor_id', None) is None
        )
        
        needs_onboarding = (
            not has_completed_onboarding or
            not has_company or
            needs_instructor_assignment
        )
        
        logger.debug(
            f"Onboarding status for user {user.id}: "
            f"completed={has_completed_onboarding}, "
            f"has_company={has_company}, "
            f"needs_instructor={needs_instructor_assignment}, "
            f"overall_needed={needs_onboarding}" 
        )
        
        return needs_onboarding, has_completed_onboarding
    
    except Exception as e:
        logger.error(f"Error calculating onboarding status for user {user.id}: {e}")
        return True, False

def _build_token_response(user: User, access_token: str) -> Token:
    """
    Build a complete Token response from user data

    Args:
        user: User object with current data
        access_token: JWT token string
        
    Returns:
        Token schema instance with all required fields
    """
    
    needs_onboarding, has_completed_onboarding = _calculate_onboarding_status(user)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        needs_onboarding=needs_onboarding,
        has_completed_onboarding=has_completed_onboarding,
        company_id=user.company_id,
        instructor_id=getattr(user, 'instructor_id', None)
    )
    
@router.post("/validate-invite", response_model=InviteCodeInfo)
def validate_invite_code(
    request: InviteCodeValidation,
    db: Session = Depends(get_db)
):
    """
    Validate a company invite code and return company information
    
    Args:
        request: Invite code validation request
        db: Database session
        
    Returns:
        Company information if code is valid
    
    Raises:
        HTTPException: If code is invalid or expired
    """
    
    try:
        logger.info(f"Validating invite code: {request.code[:4]}...")
        
        company_info = validate_invite_code_info(db=db, code=request.code)
        
        if not company_info:
            logger.warning(f"Invalid invite code attempted: {request.code[:4]}...")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired invite code"
            )
        
        logger.info(f"Invite code validated for company: {company_info.company_name}")
        return company_info
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating invite code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while validating the invite code"
        )

@router.post("/signup", response_model=UserInfo, status_code=status.HTTP_201_CREATED)
def enhanced_signup(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Enhanced signup endpoint for complete onboarding flow
    
    Args:
        user_data: Complete signup data with invite code
        db: Database session
    
    Returns:
        Created user information
    
    Raises:
        HTTPException: If data validation fails or user creation fails
    """
    
    try:
        logger.info(f"Enhanced signup for: {user_data.email}")
        
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user:
            logger.warning(f"Signup attempted with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        company = get_company_by_id(db, user_data.company_id)
        if not company:
            logger.error(f"Signup attempted with invalid company ID: {user_data.company_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid company"
            )
        
        if not company.is_active:
            logger.warning(f"Signup attempted with inactive company: {company.name}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company is not active"
            )
        
        instructor = None
        if user_data.instructor_id:
            if user_data.role != UserRole.STUDENT:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only students can be assigned to an instructor"
                )
            
            instructor = get_user_by_id(db, user_data.instructor_id)
            if not instructor:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Instructor not found"
                )
            
            if instructor.role != UserRole.INSTRUCTOR:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Selected user is not an instructor"
                )
            
            if instructor.company_id != user_data.company_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Instructor must be in the same company"
                )
            
            logger.info(f"Student {user_data.email} will be assigned to instructor {instructor.email}")
            
        course = None
        if user_data.role == UserRole.STUDENT: 
            if not user_data.course_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Course selection is required for student registration"
                )
            
            course = db.query(Course).filter(
                Course.id == user_data.course_id,
                Course.is_active == True
            ).first()
            
            if not course:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Selected course is not available"
                )
                
        if user_data.invite_code:
            code_consumed = consume_invite_code(db, user_data.invite_code)
            if not code_consumed:
                logger.warning(f"Failed to consume invite code during signup for {user_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired invite code"
                )
            logger.info(f"Invite code consumed for {user_data.email}")
        
        user_create_data = UserCreate(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            company_id=user_data.company_id,
            instructor_id=user_data.instructor_id,
            has_completed_onboarding=True  
        )
        new_user = create_user(db, user_create_data)
        
        profile_data = create_registration_profile_data(
            user=new_user,
            course_id=user_data.course_id if new_user.role == UserRole.STUDENT else None
        )
        create_profile(db, new_user.id, profile_data)
        enrollment = None
        if new_user.role == UserRole.STUDENT and user_data.course_id:
            enrollment = StudentEnrollment(
                student_id=new_user.id,
                course_id=user_data.course_id,
                status=EnrollmentStatus.ACTIVE,
                current_week=1,
                enrolled_at=datetime.now()
            )
            
            db.add(enrollment)
            logger.info(f"Student {new_user.email} enrolled in course ID {user_data.course_id}")
        
        db.commit()
        
        db.refresh(new_user)
        if enrollment:
            db.refresh(enrollment)
            
        return UserInfo(
            user_id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            role=new_user.role,
            company_id=new_user.company_id,
            instructor_id=getattr(new_user, 'instructor_id', None),
            has_completed_onboarding=True,
            is_active=new_user.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup for {user_data.email}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account"
        )
        
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db)
):
    """
    Legacy registration endpoint for basic user creation

    Args:
        user_data: Basic user creation data
        db: Database session
        
    Returns:
        Newly created user information
    """

    logger.info(f"Legacy registration for: {user_data.email}")
    
    db_user = get_user_by_email(db, user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = create_user(db, user_data)
    logger.info(f"Legacy registration successful for: {new_user.email}")
    
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access token
    
    Args:
        form_data: OAuth2 password request form (email as username)
        db: Database session
        
    Returns:
        Complete token response with user information
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        logger.info(f"Login attempt for: {form_data.username}")
        
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Failed login attempt for: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )

        logger.info(f"Authentication successful for: {form_data.username}")
        
        access_token = create_user_token(user)
        
        response = _build_token_response(user, access_token)
        
        logger.info(f"Login successful for {user.email}, returning completed token response")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed for {form_data.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.get("/me", response_model=UserInfo)
def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user's information
    
    Args:
        current_user: Current authenticated user from JWT token
    
    Returns:
        Current user's information with onboarding status
    """

    logger.debug(f"User info requested for: {current_user.email}")
    
    _, has_completed_onboarding = _calculate_onboarding_status(current_user)
    print(current_user.id)
    return UserInfo(
        user_id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        company_id=current_user.company_id,
        instructor_id=getattr(current_user, 'instructor_id', None),
        has_completed_onboarding=has_completed_onboarding,
        is_active=current_user.is_active
    )

@router.get("/refresh", response_model=Token)
def refresh_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refresh user information and return updated token

    Args:
        current_user: Current authenticated user from JWT token
        db: Database session
        
    Returns:
        Updated token with fresh user information
    
    Raises:
        HTTPException: If user not found or refresh fails
    """
    
    try:
        logger.info(f"Refreshing user info for: {current_user.email}")
        
        fresh_user = get_user_by_id(db, current_user.id)
        if not fresh_user:
            logger.error(f"User not found during refresh: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        access_token = create_user_token(fresh_user)
        
        response = _build_token_response(fresh_user, access_token)
        
        logger.info(f"User info refreshed successfully for {fresh_user.email}")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing user info for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh user information"
        )