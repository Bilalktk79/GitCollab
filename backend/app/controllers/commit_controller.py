from fastapi import HTTPException
from app.models.commit_review_model import CommitReviewCreate, CommitReviewUpdate
from app.services.commit_review_service import (
    create_commit_review,
    get_all_commit_reviews,
    get_commit_review_by_id,
    get_commit_review_by_sha,
    update_commit_review_status
)


def create_review_controller(review_data: CommitReviewCreate):
    try:
        return create_commit_review(review_data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create commit review: {str(e)}")


def get_reviews_controller():
    try:
        return get_all_commit_reviews()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commit reviews: {str(e)}")


def get_review_by_id_controller(review_id: str):
    try:
        review = get_commit_review_by_id(review_id)

        if not review:
            raise HTTPException(status_code=404, detail="Commit review not found")

        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commit review: {str(e)}")


def get_review_by_sha_controller(commit_sha: str):
    try:
        review = get_commit_review_by_sha(commit_sha)

        if not review:
            raise HTTPException(status_code=404, detail="Commit review not found")

        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commit review: {str(e)}")


def update_review_status_controller(review_id: str, update_data: CommitReviewUpdate):
    try:
        updated_review = update_commit_review_status(
            review_id=review_id,
            status=update_data.status,
            review_comment=update_data.review_comment,
            reviewed_by=update_data.reviewed_by
        )

        if not updated_review:
            raise HTTPException(status_code=404, detail="Commit review not found")

        return updated_review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update commit review: {str(e)}")