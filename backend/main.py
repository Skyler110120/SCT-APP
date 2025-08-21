from fastapi import FastAPI
from app.routers import (
    auth, 
    profile, 
    session, 
    user, 
    onboarding, 
    company, 
    invite_code,
    events,
    instructor_availability,
    course,
    instructor
)
from fastapi.middleware.cors import CORSMiddleware


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
app.include_router(user.router)
app.include_router(company.router)
app.include_router(invite_code.router)
app.include_router(onboarding.router)
app.include_router(events.router)
app.include_router(instructor_availability.router)
app.include_router(course.router)
app.include_router(instructor.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Root endpoint to check if the server is running."""
    return{"status": "OK", "message": "SCT Backend API is running"}

