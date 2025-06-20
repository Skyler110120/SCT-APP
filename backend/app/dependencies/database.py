from app.database.database import SessionLocal

def get_db():
    """
    FastAPI dependency which provides a database session
    Yield allows the database session to be used in the route,
    and closes it even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()