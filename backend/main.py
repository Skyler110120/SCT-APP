from fastapi import FastAPI
from app.routers import auth, profile, session


# Run the environment using source venv/bin/activate
# Start the server using uvicorn main:app --reload 

app = FastAPI(
    title="SCT Backend API",
    description="API for the SCT application",
    version="0.1.0",
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(session.router)

@app.get("/")
def read_root():
    """Root endpoint to check if the server is running."""
    return{"status": "OK", "message": "SCT Backend API is running"}
 
