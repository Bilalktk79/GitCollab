from fastapi import APIRouter
from app.models.commit_review_model import CommitReviewCreate, CommitStatusUpdate
from app.controllers.commit_review_controller import (
    create_commit_review_controller,
    get_all_commit_reviews_controller,
    get_commit_review_controller,
    update_commit_status_controller,
    delete_commit_review_controller,
)


router = APIRouter(prefix="/api/commits", tags=["Commit Reviews"])


@router.post("/create")
def create_commit_review(data: CommitReviewCreate):
    return create_commit_review_controller(data)


@router.get("/all")
def get_all_commit_reviews():
    return get_all_commit_reviews_controller()


@router.get("/{commit_id}")
def get_commit_review(commit_id: str):
    return get_commit_review_controller(commit_id)


@router.put("/{commit_id}/status")
def update_commit_review_status(commit_id: str, data: CommitStatusUpdate):
    return update_commit_status_controller(commit_id, data)


@router.delete("/{commit_id}")
def delete_commit_review(commit_id: str):
    return delete_commit_review_controller(commit_id)