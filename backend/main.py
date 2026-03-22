from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os


from separate import separate_stems

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello World!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "File received successfully!"
    }
@app.post("/separate")
async def separate_stems_endpoint(
    file: UploadFile = File(...),
    stems_to_remove: str = "vocals,drums"  # comma separated string from frontend
):
    # Save the uploaded file to disk first
    upload_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parse the comma separated stems string into a list
    remove_list = [s.strip() for s in stems_to_remove.split(",")]
    
    # Call your separate module
    output_path = separate_stems(upload_path, remove_list)
    
    return {
        "message": "Stems separated successfully",
        "output": output_path,
    }