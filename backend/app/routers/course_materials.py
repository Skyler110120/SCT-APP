from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.schemas.course_materials import (
    MaterialAccessRequest,
    MaterialAccessResponse,
    MaterialInfoResponse,
    MaterialErrorResponse,
)
from app.services.s3_service import generate_course_pdf_url, generate_instructor_script_url
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.course import Course
from app.models.user import User, UserRole

router = APIRouter(
    prefix="/materials",
    tags=["Course Materials"]
)

@router.get("/course/{course_id}/info", response_model=MaterialInfoResponse)
async def get_course_material_info(
    course_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get information about course materials
    """
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=404, 
                detail="Course not found"
            )
        
        can_access_script = current_user.role in [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.MASTERADMIN]
        
        return MaterialInfoResponse(
            course_id=course.id,
            course_title=course.title,
            has_pdf=course.had_pdf(),
            has_script=True,
            can_access_script=can_access_script
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to get material info"
        )
        
@router.post("/courses/{course_id}/pdf/access", response_model=MaterialAccessResponse)
async def get_course_pdf_access(
    course_id: int = Path(..., ge=1),
    request: MaterialAccessRequest = MaterialAccessRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 
    """
    Generate temporary access URL for course-specific PDF.
    
    Returns pre-signed URL that lasts an hour
    """
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )
        
        if not course.has_pdf():
            raise HTTPException(
                status_code=404,
                detail="Course PDF not available"
            )
        
        url_data = generate_course_pdf_url(course_id)
        
        return MaterialAccessResponse(
            success=True,
            access_url=url_data['url'],
            expires_at=url_data['expires_at'],
            expires_in_seconds=url_data['expires_in_seconds'],
            material_type="course_pdf",
            course_title=course.title,
            course_id=course.id
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate access URL"
        )
        
@router.post("/script/access", response_model=MaterialAccessResponse)
async def get_instructor_script_access(
    request: MaterialAccessRequest = MaterialAccessRequest(),
    current_user: User = Depends(get_current_user)
):
    """
    Generate access to instructor script
    Only instructors and admins can access
    """
    try:
        if current_user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.MASTERADMIN]:
            raise HTTPException(
                status_code=403,
                detail="Instructor access required"
            )
        url_data = generate_instructor_script_url()
        
        return MaterialAccessResponse(
            success=True,
            access_url=url_data['url'],
            expires_at=url_data['expires_at'],
            expires_in_seconds=url_data['expires_in_seconds'],
            material_type="instructor_script",
            course_title="Instructor Script",
            course_id=0
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate access URL"
        )