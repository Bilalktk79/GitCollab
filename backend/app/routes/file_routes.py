from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import shutil
import os
from datetime import datetime

from app.database.db import files_collection

router = APIRouter()

UPLOAD_FOLDER = "app/uploads/repository_files"

# Create Upload Folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# Upload File
# -----------------------------

@router.post("/upload")
def upload_file(
    repo_id: str,
    uploaded_by: str,
    file: UploadFile = File(...)
):

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save File Info in DB
    file_data = {
        "repo_id": repo_id,
        "file_name": file.filename,
        "file_path": file_path,
        "uploaded_by": uploaded_by,
        "uploaded_at": datetime.utcnow()
    }

    files_collection.insert_one(file_data)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }


# -----------------------------
# Get Files
# -----------------------------

@router.get("/")
def get_files():

    files = list(files_collection.find())

    for file in files:
        file["_id"] = str(file["_id"])

    return files


# -----------------------------
# Download File
# -----------------------------

@router.get("/download/{filename}")
def download_file(filename: str):

    file_path = f"{UPLOAD_FOLDER}/{filename}"

    return FileResponse(
        path=file_path,
        filename=filename
    )