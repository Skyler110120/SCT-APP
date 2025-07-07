import sys
import os
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(parent_dir))

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.password import hash_password
from dotenv import load_dotenv

load_dotenv()

def create_master_admin():
    admin_email = os.getenv("MASTER_ADMIN_EMAIL")
    admin_password = os.getenv("MASTER_ADMIN_PASSWORD")
    admin_first_name = os.getenv("MASTER_ADMIN_FIRST_NAME", "System")
    admin_last_name = os.getenv("MASTER_ADMIN_LAST_NAME", "Administrator")
    
    if not admin_email or not admin_password:
        print("Error: MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD must be set in .env")
        
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"Admin with emai {admin_email} already exists")
            return
        
        master_admin = User(
            email = admin_email,
            hashed_password = hash_password(admin_password),
            first_name = admin_first_name,
            last_name = admin_last_name,
            role = UserRole.MASTERADMIN,
            has_completed_onboarding = True
        )
        
        db.add(master_admin)
        db.commit()
        print(f"Masster admin created successfully: {admin_email}")
    except Exception as e:
        print(f"Error creating master admin: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    create_master_admin()
