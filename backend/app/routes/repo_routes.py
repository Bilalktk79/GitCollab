from fastapi import APIRouter, HTTPException

from datetime import datetime

from bson import ObjectId

from app.database.db import repos_collection

router = APIRouter()


# =========================================
# CREATE REPOSITORY
# =========================================

@router.post("/create")

def create_repo(data: dict):

    # VALIDATION

    if not data.get("repo_name"):

        raise HTTPException(
            status_code=400,
            detail="Repository name required"
        )

    # REPOSITORY OBJECT

    repo = {

        "repo_name": data.get("repo_name"),

        "description": data.get(
            "description",
            ""
        ),

        "visibility": data.get(
            "visibility",
            "public"
        ),

        "owner_id": data.get(
            "owner_id"
        ),

        "starred": False,

        "created_at": datetime.utcnow()

    }

    # INSERT INTO DATABASE

    result = repos_collection.insert_one(repo)

    # RETURN CREATED REPO

    repo["_id"] = str(result.inserted_id)

    return repo


# =========================================
# GET ALL REPOSITORIES
# =========================================

@router.get("/")

def get_repositories():

    repos = list(
        repos_collection.find()
    )

    # CONVERT OBJECT ID

    for repo in repos:

        repo["_id"] = str(repo["_id"])

    return repos


# =========================================
# DELETE REPOSITORY
# =========================================

@router.delete("/{repo_id}")

def delete_repo(repo_id: str):

    # CHECK VALID OBJECT ID

    if not ObjectId.is_valid(repo_id):

        raise HTTPException(
            status_code=400,
            detail="Invalid repository ID"
        )

    # DELETE REPOSITORY

    result = repos_collection.delete_one({

        "_id": ObjectId(repo_id)

    })

    # CHECK IF EXISTS

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Repository not found"
        )

    return {

        "message":
        "Repository deleted successfully"

    }