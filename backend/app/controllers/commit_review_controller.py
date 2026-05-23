from fastapi import HTTPException
from app.models.commit_review_model import CommitReviewCreate, CommitStatusUpdate
from app.services.commit_review_service import (
    create_commit_review,
    get_all_commit_reviews,
    get_commit_review_by_commit_id,
    update_commit_review_status,
    delete_commit_review,
)


def create_commit_review_controller(data: CommitReviewCreate):
    if not data.commit_id.strip():
        raise HTTPException(status_code=400, detail="commit_id is required")

    if not data.repo_name.strip():
        raise HTTPException(status_code=400, detail="repo_name is required")

    if not data.developer_name.strip():
        raise HTTPException(status_code=400, detail="developer_name is required")

    if not data.message.strip():
        raise HTTPException(status_code=400, detail="commit message is required")

    return create_commit_review(data)


def get_all_commit_reviews_controller():
    return get_all_commit_reviews()


def get_commit_review_controller(commit_id: str):
    commit = get_commit_review_by_commit_id(commit_id)

    if not commit:
        raise HTTPException(status_code=404, detail="Commit review not found")

    return commit


def update_commit_status_controller(commit_id: str, data: CommitStatusUpdate):
    allowed_statuses = ["Pending Review", "Approved", "Changes Requested"]

    if data.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid commit review status")

    updated_commit = update_commit_review_status(commit_id, data)

    if not updated_commit:
        raise HTTPException(status_code=404, detail="Commit review not found")

    return updated_commit


def delete_commit_review_controller(commit_id: str):
    deleted = delete_commit_review(commit_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Commit review not found")

    return {"message": "Commit review deleted successfully"}