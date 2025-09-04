import boto3
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from botocore.exceptions import ClientError
from app.core.config import settings
from app.models import Course

class S3Service:
    def __init__(self):
        """
        Initalize S3 client with your AWS credentials
        """
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )
            self.bucket_name = settings.aws_s3_bucket_name
        except Exception as e:
            raise Exception(f"Failed to initialize AWS S3: {e}")

    def generate_course_pdf_url(self, course: Course) -> Dict[str, Any]:
        """
        Generate a temporary URL for viewing course PDF
        
        Args:
            course_id: ID of the course
        Returns:
            Dictionary with URL and expiration time
        """
        if not course.has_pdf():
            raise ValueError("Course {course.course_id} does not have a PDF available")
        
        object_key = course.get_pdf_s3_key
        return self._generate_presigned_url(object_key, course.course_id, "course_pdf")

    def generate_instructor_script_url(self, course: Course = None) -> Dict[str, Any]:
        """
        Generate a temporary URL for viewing instructor script
        """
        object_key =course.get_script_s3_key
        return self._generate_presigned_url(object_key, 0, "instructor_script")

    def _generate_presigned_url(self, object_key: str, course_id: int, material_type: str):
        """
        Generate the presigned URL
        
        Args:
            object_key: S3 object key
            course_id: ID of the course
            material_type: Type of material
        """
        try: 
            print(f"Generating URL for bucket: {self.bucket_name}")
            print(f"Object key: {object_key}")
            
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key,
                    'ResponseContentType': 'application/pdf',
                    'ResponseContentDisposition': 'inline'
                },
                ExpiresIn=3600
            )
            
            expires_at = datetime.now(timezone.utc) + timedelta(hours = 1)
            
            return {
                'url': presigned_url,
                'expires_at': expires_at.isoformat(),
                'expires_in_seconds': 3600,
                'course_id': course_id,
                'material_type': material_type,
                'bucket': self.bucket_name,
                'object_key': object_key
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                raise ValueError(f"File not found: {object_key} in bucket {self.bucket_name}")
            elif error_code == 'NoSuchBucket':
                raise ValueError(f"Bucket not found: {self.bucket_name}")
            else:
                raise Exception(f"AWS error: {e}")
                
    def test_connection(self) -> bool:
        """
        Test connection to your S3 bucket
        """
        try:
            print(f"Testing connection to bucket: {self.bucket_name}")
            print(f"Region: {settings.aws_region}")
                
            response = self.s3_client.head_bucket(Bucket=self.bucket_name)
            print("Bucket access successful")
            return True
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                print(f"Bucket not found: {self.bucket_name}")
            elif error_code == '403':
                print(f"Access denied to bucket: {self.bucket_name}")
            else:
                print(f"AWS error: {e}")
            return False
        except Exception as e:
            print(f"Connection error: {e}")
            return False
        
s3_service = S3Service()