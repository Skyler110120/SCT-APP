from fastapi import FastAPI

# Run the environment using source venv/bin/activate
# Start the server using uvicorn main:app --reload

app = FastAPI()

@app.get("/ping")
def ping():
    return {"message": "pong"}
 
