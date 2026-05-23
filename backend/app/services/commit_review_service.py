from datetime import datetime
from app.database.db import db
from app.services.notification_service import create_notification


commit_reviews_collection = db["commit_reviews"]


def serialize_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def serialize_commit_review(commit):
    return {
        "id": str(commit["_id"]),
        "commit_id": commit.get("commit_id", ""),
        "repo_id": commit.get("repo_id", ""),
        "repo_name": commit.get("repo_name", ""),
        "repo_link": commit.get("repo_link", ""),
        "developer_id": commit.get("developer_id", ""),
        "developer_name": commit.get("developer_name", ""),
        "branch": commit.get("branch", "main"),
        "message": commit.get("message", ""),
        "changed_files": commit.get("changed_files", []),
        "status": commit.get("status", "Pending Review"),
        "feedback": commit.get("feedback", ""),
        "priority": commit.get("priority", "Medium"),
        "commit_type": commit.get("commit_type", "General"),
        "summary": commit.get("summary", ""),
        "created_at": serialize_datetime(commit.get("created_at")),
        "updated_at": serialize_datetime(commit.get("updated_at")),
    }


def normalize_commit_review_data(data):
    """
    Ye helper Pydantic model aur normal dict dono ko same format mein convert karta hai.
    Isse manual /api/commits/create bhi chalega aur upload controller se auto-create bhi chalega.
    """

    if hasattr(data, "dict"):
        data = data.dict()

    changed_files = data.get("changed_files", [])

    normalized_files = []

    for file in changed_files:
        if hasattr(file, "dict"):
            normalized_files.append(file.dict())
        else:
            normalized_files.append(file)

    return {
        "commit_id": data.get("commit_id", ""),
        "repo_id": data.get("repo_id", ""),
        "repo_name": data.get("repo_name", ""),
        "repo_link": data.get("repo_link", ""),
        "developer_id": data.get("developer_id", ""),
        "developer_name": data.get("developer_name", ""),
        "branch": data.get("branch", "main"),
        "message": data.get("message", ""),
        "changed_files": normalized_files,
        "status": data.get("status", "Pending Review"),
        "feedback": data.get("feedback", ""),
        "priority": data.get("priority", "Medium"),
        "commit_type": data.get("commit_type", "General"),
        "summary": data.get("summary", ""),
    }


def create_commit_review(data):
    data = normalize_commit_review_data(data)

    existing_commit = commit_reviews_collection.find_one({
        "commit_id": data["commit_id"]
    })

    if existing_commit:
        return serialize_commit_review(existing_commit)

    now = datetime.utcnow()

    commit = {
        "commit_id": data["commit_id"],
        "repo_id": data["repo_id"],
        "repo_name": data["repo_name"],
        "repo_link": data["repo_link"],
        "developer_id": data["developer_id"],
        "developer_name": data["developer_name"],
        "branch": data["branch"],
        "message": data["message"],
        "changed_files": data["changed_files"],
        "status": data["status"],
        "feedback": data["feedback"],
        "priority": data["priority"],
        "commit_type": data["commit_type"],
        "summary": data["summary"],
        "created_at": now,
        "updated_at": now,
    }

    result = commit_reviews_collection.insert_one(commit)
    commit["_id"] = result.inserted_id

    return serialize_commit_review(commit)


def get_all_commit_reviews():
    commits = commit_reviews_collection.find().sort("created_at", -1)
    return [serialize_commit_review(commit) for commit in commits]


def get_commit_review_by_commit_id(commit_id: str):
    commit = commit_reviews_collection.find_one({
        "commit_id": commit_id
    })

    if not commit:
        return None

    return serialize_commit_review(commit)


def update_commit_review_status(commit_id: str, data):
    commit = commit_reviews_collection.find_one({
        "commit_id": commit_id
    })

    if not commit:
        return None

    if hasattr(data, "dict"):
        data = data.dict()

    update_data = {
        "status": data.get("status"),
        "feedback": data.get("feedback", ""),
        "updated_at": datetime.utcnow(),
    }

    commit_reviews_collection.update_one(
        {"commit_id": commit_id},
        {"$set": update_data}
    )

    updated_commit = commit_reviews_collection.find_one({
        "commit_id": commit_id
    })

    developer_id = updated_commit.get("developer_id")

    if developer_id:
        create_notification({
            "user_id": developer_id,
            "title": "Commit Review Updated",
            "message": f"Your commit {commit_id} status is now {update_data['status']}.",
            "type": "commit_review",
            "related_id": commit_id,
        })

    return serialize_commit_review(updated_commit)


def delete_commit_review(commit_id: str):
    result = commit_reviews_collection.delete_one({
        "commit_id": commit_id
    })

    return result.deleted_count > 0