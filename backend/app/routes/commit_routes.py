from fastapi import APIRouter
from app.models.commit_review_model import CommitReviewCreate, CommitReviewUpdate
from app.controllers.commit_controller import (
    create_review_controller,
    get_reviews_controller,
    get_review_by_id_controller,
    get_review_by_sha_controller,
    update_review_status_controller
)

router = APIRouter(
    prefix="/api/commits",
    tags=["Commit Reviews"]
)


@router.post("/review")
def create_commit_review_route(review_data: CommitReviewCreate):
    return create_review_controller(review_data)


@router.get("/reviews")
def get_commit_reviews_route():
    return get_reviews_controller()


@router.get("/reviews/{review_id}")
def get_commit_review_by_id_route(review_id: str):
    return get_review_by_id_controller(review_id)


@router.get("/sha/{commit_sha}")
def get_commit_review_by_sha_route(commit_sha: str):
    return get_review_by_sha_controller(commit_sha)


@router.put("/reviews/{review_id}/status")
def update_commit_review_status_route(review_id: str, update_data: CommitReviewUpdate):
    return update_review_status_controller(review_id, update_data)