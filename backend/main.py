from fastapi import FastAPI
from app.database.database import engine, Base

# Run the environment using source venv/bin/activate
# Start the server using uvicorn main:app --reload 

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/ping")
def ping():
    return {"message": "pong"}
 
