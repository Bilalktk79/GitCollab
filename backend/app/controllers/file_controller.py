from fastapi import UploadFile, File
from fastapi.responses import FileResponse
from datetime import datetime
import shutil
import os

from app.database.db import files_collection

UPLOAD_FOLDER = "app/uploads/repository_files"

# Create Upload Folder
os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# -----------------------------
# Upload File
# -----------------------------

def upload_file_controller(
    repo_id: str,
    uploaded_by: str,
    file: UploadFile = File(...)
):

    file_path = (
        f"{UPLOAD_FOLDER}/{file.filename}"
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

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

def get_files_controller():

    files = list(
        files_collection.find()
    )

    for file in files:
        file["_id"] = str(file["_id"])

    return files


# -----------------------------
# Download File
# -----------------------------

def download_file_controller(
    filename: str
):

    file_path = (
        f"{UPLOAD_FOLDER}/{filename}"
    )

    return FileResponse(
        path=file_path,
        filename=filename
    )