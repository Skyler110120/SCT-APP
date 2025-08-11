from fastapi import APIRouter, Depends, status, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas.course import (
    CourseSummary, CourseStudentRead, CourseInstructorRead, CourseAdminRead,
    CourseCreate, CourseUpdate, VideoCreate, VideoUpdate, VideoRead
)
from app.schemas.enrollment import (
    EnrollmentCreate, EnrollmentRead, EnrollmentWithCourse,
    WeeklyProgressUpdate, StudentWeeklyProgress
)
from app.services.course_service import (
    get_courses_for_selection,
    enroll_student,
    get_student_course,
    drop_student_from_course,
    get_all_courses_instructor_and_admin,
    update_student_weekly_progress,
    get_students_progress_by_role,
    get_all_courses_admin,
    create_course,
    update_course,
    delete_course,
    add_video_to_course,
    update_video_admin,
    remove_video_from_course,
)
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)

@router.get("/", response_model=List[CourseSummary])
def list_courses_for_selection(
    db: Session = Depends(get_db)
):
    """
    List all courses available for selection
    """
    
    try:
        courses = get_courses_for_selection(db)
        return courses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch courses: {str(e)}"
        )

@router.post("/enroll", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    enrollment_data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enroll a student in a course
    """
    
    try:
        enrollment = enroll_student(db, current_user, enrollment_data)
        return enrollment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enroll student: {str(e)}"
        )

@router.get("/my-course", response_model=Optional[EnrollmentWithCourse])
def get_my_enrolled_course(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the couse a student is enrolled in
    """
    
    try:
        enrollment = get_student_course(db, current_user)
        return enrollment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch enrolled course: {str(e)}"
        )

@router.delete("/my-enrollment", status_code=status.HTTP_204_NO_CONTENT)
def drop_from_course(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Drop a student from their enrolled course
    """
    
    try:
        drop_student_from_course(db, current_user)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to drop from course: {str(e)}"
        )
    
@router.get("/instructor", response_model=List[CourseInstructorRead])
def list_courses_for_instructor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all courses for instructor and administrators
    """
    
    try:
        courses = get_all_courses_instructor_and_admin(db, current_user)
        return courses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch instructor courses: {str(e)}"
        )

@router.get("/instructor/students", response_model=List[StudentWeeklyProgress])
def get_students_progress_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get progress overview of all students for instructor
    """
    
    try:
        students = get_students_progress_by_role(db, current_user)
        return students
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch students progress: {str(e)}"
        )

@router.patch("/progress", response_model=EnrollmentRead)
def update_student_progress(
    progress_data: WeeklyProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the progress of a student in a course
    """
    
    try:
        enrollment = update_student_weekly_progress(db, current_user, progress_data)
        return enrollment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update student progress: {str(e)}"
        )

@router.get("/admin", response_model=List[CourseAdminRead])
def list_courses_for_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all courses for Master Admin
    """
    
    try:
        courses = get_all_courses_admin(db, current_user)
        return courses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin courses: {str(e)}"
        )

@router.post("/", response_model=CourseAdminRead, status_code=status.HTTP_201_CREATED)
def create_new_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new course
    """   
    
    try:
        course = create_course(db, course_data, current_user)
        return course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create course: {str(e)}"
        )

@router.patch("/{course_id}", response_model=CourseAdminRead)
def update_existing_course(
    course_id: int = Path(..., description="ID of the course to update", ge=1),
    course_data: CourseUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing course
    """
    
    try:
        updated_course = update_course(db, course_id, course_data, current_user)
        return updated_course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update course: {str(e)}"
        )

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_course(
    course_id: int = Path(..., description="ID of the course to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an existing course
    """
    
    try:
        delete_course(db, course_id, current_user)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete course: {str(e)}"
        )

@router.post("/{course_id}/videos", response_model=VideoRead, status_code=status.HTTP_201_CREATED)
def add_video_to_course(
    course_id: int = Path(..., description="ID of the course to add video to", ge=1),
    video_data: VideoCreate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a video to a course
    """
    
    try:
        video = add_video_to_course(db, course_id, video_data, current_user)
        return video
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add video to course: {str(e)}"
        )

@router.patch("/videos/{video_id}", response_model=VideoRead)
def update_course_video(
    video_id: int = Path(..., description="ID of the video to update"),
    video_data: VideoUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing video in a course
    """
    
    try:
        updated_video = update_video_admin(db, video_id, video_data, current_user)
        return updated_video
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update video: {str(e)}"
        )

@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_course_video(
    video_id: int = Path(..., description="ID of the video to remove"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a video from a course
    """
    
    try:
        remove_video_from_course(db, video_id, current_user)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove video from course: {str(e)}"
        )