from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.course import Course
from app.models.course_video import CourseVideo
from app.models.student_enrollment import StudentEnrollment, EnrollmentStatus, ProgressionDecision
from app.models.user import User, UserRole
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseStudentRead, CourseSummary, 
    CourseAdminRead, CourseInstructorRead, VideoCreate, VideoUpdate, VideoRead
)
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead, EnrollmentWithCourse, WeeklyProgressUpdate, StudentWeeklyProgress

def add_video_to_course(
    db: Session,
    course_id: int,
    video_data: VideoCreate,
    admin: User,
) -> VideoRead:
    """
    Add a video to a course
    
    Args:
        db: Database session
        admin: Admin user adding the video
        course_id: ID of the course to add the video to
        video_data: Data for the new video
        
    Returns:
        Details of the added video
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can add videos to courses"
        )
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
        
    existing_video = db.query(CourseVideo).filter(
        CourseVideo.course_id == course_id,
        CourseVideo.order_index == video_data.order_index
    ).first()
    if existing_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A video with order index {video_data.order_index} already exists in this course"
        )
    
    if video_data.week_number and (video_data.week_number < 1 or video_data.week_number > 24):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Week number must be between 1 and 24"
        )
    
    video = CourseVideo(
        title=video_data.title,
        description=video_data.description,
        video_url=video_data.video_url,
        order_index=video_data.order_index,
        week_number=video_data.week_number,
        course_id=course_id
    )
    
    db.add(video)
    db.commit()
    db.refresh(video)
    
    return video

def update_video_admin(
    db: Session,
    video_id: int,
    video_data: VideoUpdate,
    admin: User,
) -> VideoRead:
    """
    Update an existing video
    
    Args:
        db: Database session
        admin: Admin user updating the video
        video_id: ID of the video to update
        video_data: Updated data for the video
    
    Returns:
        Details of the updated video
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can update videos"
        )
    
    video = db.query(CourseVideo).filter(CourseVideo.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    if video_data.order_index and video_data.order_index != video.order_index:
        existing_video = db.query(CourseVideo).filter(
            CourseVideo.course_id == video.course_id,
            CourseVideo.order_index == video_data.order_index,
            CourseVideo.id != video_id
        ).first()
    
        if existing_video:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A video with this order index already exists in the course"
            )
    
    if video_data.week_number and (video_data.week_number < 1 or video_data.week_number > 24):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Week number must be between 1 and 24"
        )
    
    update_data = video_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(video, field, value)
    
    db.commit()
    db.refresh(video)
    
    return video

def remove_video_from_course(db: Session, video_id: int,  admin: User) -> None:
    """
    Remove a video from a course
    
    Args:
        db: Database session
        admin: Admin user removing the video
        video_id: ID of the video to remove
        
    Returns:
        None
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can remove videos from courses"
        )
    
    video = db.query(CourseVideo).filter(CourseVideo.id == video_id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    db.delete(video)
    db.commit()
    
def create_course(db: Session, course_data: CourseCreate, admin: User) -> CourseAdminRead:
    """
    MasterAdmin Creates a new course
    
    Args:
        db: Database session
        admin: Admin user creating the course
        course_data: Data for the new course
    Returns:
        Details of the created course
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can create courses"
        )
    
    exisiting = db.query(Course).filter(
        Course.order_index == course_data.order_index,
    ).first()
    
    if exisiting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A course with this order index already exists"
        )
    
    course = Course(**course_data.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    
    return course

def get_all_courses_admin(db: Session, admin: User) -> List[CourseAdminRead]:
    """
    Get all courses with full details
    
    Args:
        db: Database session
        admin: Admin user requesting the courses
    
    Returns:
        List of courses with full details
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the Master Admin can access full course details"
        )
    
    return db.query(Course).order_by(Course.order_index).all()

def update_course(
    db: Session, 
    course_id: int, 
    course_data: CourseUpdate, 
    admin: User
) -> CourseAdminRead:
    """
    Update an existing course
    
    Args:
        db: Database session
        admin: Admin User Updating the course
        course_id: ID of the course to update
        course_data: Updated data for the course
    
    Returns:
        Details of the updated course
    """
    
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can update courses"
        )
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    update_data = course_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course

def delete_course(db: Session, course_id: int, admin: User) -> None:
    """
    Delete a course
    
    Args:
        db: Database session
        admin: Admin user deleting the course
        course_id: ID of the course to delete
    
    Returns:
        None
    """
    if admin.role != UserRole.MASTERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Master Admin can delete courses"
        )
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    active_count = db.query(StudentEnrollment).filter(
        StudentEnrollment.course_id == course_id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE
    ).count()
    
    if active_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete course with active enrollments"
        )
    
    db.delete(course)
    db.commit()

def get_all_courses_instructor_and_admin(db: Session, user: User) -> List[CourseInstructorRead]:
    """
    Get all courses with full details for instructor view
    
    Args:
        db: Database session
        user: User requesting the courses
        
    Returns:
        List[CourseRead]: List of courses with full details
    """
    
    if user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and administrators can access full course details"
        )
    
    return db.query(Course).filter(Course.is_active == True).order_by(Course.order_index).all()

def update_student_weekly_progress(db: Session, user: User, progress_data: WeeklyProgressUpdate) -> EnrollmentRead:
    """
    Update weekly progress for a student in a course
    
    Args:
        db: Database session
        user: Instructor updating the progress
        progress_data: Data containing student ID, course ID, and progress percentage
        
    Returns:
        Updated enrollment details with progress
    """
    
    if user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and administrators can update student progress"
        )
    
    enrollment = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == progress_data.student_id,
        StudentEnrollment.course_id == progress_data.course_id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found for the student in the specified course"
        )
    
    enrollment.instructor_decision = progress_data.decision
    enrollment.instructor_notes = progress_data.notes
    
    if progress_data.decision == ProgressionDecision.APPROVED:
        if enrollment.current_week < 24:
            enrollment.current_week += 1
        else:
            enrollment.status = EnrollmentStatus.COMPLETED
            enrollment.completed_at = datetime.now()
    
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_students_progress_by_role(db: Session, user: User) -> List[StudentWeeklyProgress]:
    """
    Show instructors students with their progress
    
    Args:
        db: Database session
        user: User requesting the student progress
    Returns:
        List of students with their weekly progress
    """
    
    if user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can access student progress"
        )
    
    enrollments = db.query(StudentEnrollment).filter(
        StudentEnrollment.status == EnrollmentStatus.ACTIVE,
    ).all()
    
    results = []
    for enrollment in enrollments:
        days_enrolled = (datetime.now() - enrollment.enrolled_at).days
        
        progress = StudentWeeklyProgress(
            enrollment_id=enrollment.id,
            student_name=f"{enrollment.student.first_name} {enrollment.student.last_name}",
            course_title=enrollment.course.title,
            current_week=enrollment.current_week,
            week_display=enrollment.week_display,
            progress_percentage=enrollment.progress_percentage,
            instructor_decision=enrollment.instructor_decision,
            instructor_notes=enrollment.instructor_notes,
            days_since_enrollment=days_enrolled,
        )
        results.append(progress)
    
    return results

def get_courses_for_selection(db: Session) -> List[CourseSummary]:
    """
    Get all course for selection during onboarding
    
    Args:
        db: Database session    
    
    Returns:
        List of courses with summary details
    """
    
    return db.query(Course).filter(Course.is_active == True).order_by(Course.order_index).all()

def enroll_student(db: Session, student: User, enrollment_data: EnrollmentCreate) -> EnrollmentRead:
    """
    Enroll a student in a course
    
    Args:
        db: Database session
        student: Student user enrolling in the course
        enrollment_data: Data for the enrollment
    
    Returns:
        Details of the created enrollment
    """
    
    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can enroll in courses"
        )
    
    existing = db.query(StudentEnrollment).filter(StudentEnrollment.student_id == student.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in a course"
        )
    
    course = db.query(Course).filter(Course.id == enrollment_data.course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or is inactive"
        )
    
    enrollment = StudentEnrollment(
        student_id=student.id,
        course_id=enrollment_data.course_id,
        status=EnrollmentStatus.ACTIVE,
        current_week=1
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_student_course(db: Session, student: User) -> Optional[EnrollmentWithCourse]:
    """
    Get the course details for a student
    
    Args:
        db: Database session
        student: Student user requesting their course details
    
    Returns:
        Enrollment details with course information
    """
    
    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access their course details"
        )
    
    enrollment = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student.id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE
    ).first()
    
    return enrollment

def drop_student_from_course(db: Session, student: User) -> None: 
    """
    Drop a student from their course
    
    Args:
        db: Database session
        student: Student user dropping the course
    
    Returns:
        None
    """
    
    if student.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can drop courses"
        )
    
    enrollment= db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student.id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found for the student"
        )
    
    enrollment.status = EnrollmentStatus.DROPPED
    db.commit()
