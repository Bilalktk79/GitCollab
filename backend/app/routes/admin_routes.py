from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError
from bson import ObjectId
from dotenv import load_dotenv
import os

from app.database.db import users_collection

from app.controllers.admin_controller import (
    admin_dashboard_controller,
    admin_users_controller,
    admin_repositories_controller,
    admin_commit_reviews_controller,
    admin_client_access_controller,
    admin_help_posts_controller,
    admin_notifications_controller,
    admin_logs_controller,

    # Admin Actions
    admin_block_user_controller,
    admin_unblock_user_controller,
    admin_revoke_client_controller,
    admin_activate_client_controller,
    admin_mark_help_post_solved_controller,
    admin_update_commit_status_controller,
)


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


def require_admin_user(authorization: str = Header(None)):
    """
    Admin routes ko protect karta hai.
    Header required:
    Authorization: Bearer <app_token>

    Token ke andar role admin hona chahiye
    ya database users collection mein role admin hona chahiye.
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token is required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Use Bearer token."
        )

    token = authorization.replace("Bearer ", "").strip()

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")
        token_role = payload.get("role", "developer")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token. User ID missing."
            )

        user = None

        if ObjectId.is_valid(user_id):
            user = users_collection.find_one({
                "_id": ObjectId(user_id)
            })

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        if user.get("is_blocked") is True:
            raise HTTPException(
                status_code=403,
                detail="Your account has been blocked by admin."
            )

        db_role = user.get("role", token_role)

        if db_role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required."
            )

        return {
            "user_id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "role": db_role,
        }

    except HTTPException:
        raise

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Admin authentication failed: {str(e)}"
        )


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Panel"],
    dependencies=[Depends(require_admin_user)]
)


class CommitStatusUpdateRequest(BaseModel):
    status: str


@router.get("/dashboard")
def get_admin_dashboard():
    return admin_dashboard_controller()


@router.get("/users")
def get_admin_users():
    return admin_users_controller()


@router.get("/repositories")
def get_admin_repositories():
    return admin_repositories_controller()


@router.get("/commits")
def get_admin_commit_reviews():
    return admin_commit_reviews_controller()


@router.get("/clients")
def get_admin_client_access():
    return admin_client_access_controller()


@router.get("/help-posts")
def get_admin_help_posts():
    return admin_help_posts_controller()


@router.get("/notifications")
def get_admin_notifications():
    return admin_notifications_controller()


@router.get("/logs")
def get_admin_logs():
    return admin_logs_controller()


# ==========================================================
# Admin Action Routes
# ==========================================================

@router.put("/users/{user_id}/block")
def block_user_route(user_id: str):
    return admin_block_user_controller(user_id)


@router.put("/users/{user_id}/unblock")
def unblock_user_route(user_id: str):
    return admin_unblock_user_controller(user_id)


@router.put("/clients/{client_id}/revoke")
def revoke_client_access_route(client_id: str):
    return admin_revoke_client_controller(client_id)


@router.put("/clients/{client_id}/activate")
def activate_client_access_route(client_id: str):
    return admin_activate_client_controller(client_id)


@router.put("/help-posts/{post_id}/solve")
def mark_help_post_solved_route(post_id: str):
    return admin_mark_help_post_solved_controller(post_id)


@router.put("/commits/{commit_id}/status")
def update_commit_status_route(
    commit_id: str,
    payload: CommitStatusUpdateRequest
):
    return admin_update_commit_status_controller(
        commit_id=commit_id,
        status=payload.status
    )