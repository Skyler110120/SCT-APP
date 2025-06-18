from dotenv import load_dotenv
import os

load_dotenv()
Database_URL = os.getenv("DATABASE_URL")
print("Loaded DB URL:", Database_URL)