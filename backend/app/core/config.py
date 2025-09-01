from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_url: str = "http://localhost:3000"

    master_admin_email: str
    master_admin_password: str
    master_admin_first_name: str
    master_admin_last_name: str
    
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "us-east-2"
    aws_s3_bucket_name: str = "sct-course-material-prod-stonecoldtactical"

    class Config:
        env_file = ".env"


class InviteCodeSettings:
    MAX_USE = 1
    EXPIRES_IN_DAYS = 3
    
settings = Settings()

def get_settings() -> Settings:
    return settings