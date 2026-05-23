from fastapi import HTTPException

from app.services.admin_service import (
    get_admin_dashboard_stats,
    get_admin_users,
    get_admin_repositories,
    get_admin_commit_reviews,
    get_admin_client_access,
    get_admin_help_posts,
    get_admin_notifications,
    get_admin_logs,

    # Admin Actions
    block_user,
    unblock_user,
    revoke_client_access,
    activate_client_access,
    mark_help_post_solved,
    update_commit_status,
)


def handle_service_response(response, error_status_code=400):
    """
    Service response ko check karta hai.
    Agar success False ho to HTTPException raise karta hai.
    """

    if not response.get("success"):
        raise HTTPException(
            status_code=error_status_code,
            detail=response.get("message", "Admin action failed.")
        )

    return response


def admin_dashboard_controller():
    try:
        return get_admin_dashboard_stats()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load admin dashboard: {str(e)}"
        )


def admin_users_controller():
    try:
        return get_admin_users()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load users: {str(e)}"
        )


def admin_repositories_controller():
    try:
        return get_admin_repositories()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load repositories: {str(e)}"
        )


def admin_commit_reviews_controller():
    try:
        return get_admin_commit_reviews()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load commit reviews: {str(e)}"
        )


def admin_client_access_controller():
    try:
        return get_admin_client_access()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load client access records: {str(e)}"
        )


def admin_help_posts_controller():
    try:
        return get_admin_help_posts()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load help posts: {str(e)}"
        )


def admin_notifications_controller():
    try:
        return get_admin_notifications()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load notifications: {str(e)}"
        )


def admin_logs_controller():
    try:
        return get_admin_logs()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load admin logs: {str(e)}"
        )


# ==========================================================
# Admin Action Controllers
# ==========================================================

def admin_block_user_controller(user_id: str):
    try:
        response = block_user(user_id)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to block user: {str(e)}"
        )


def admin_unblock_user_controller(user_id: str):
    try:
        response = unblock_user(user_id)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to unblock user: {str(e)}"
        )


def admin_revoke_client_controller(client_id: str):
    try:
        response = revoke_client_access(client_id)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to revoke client access: {str(e)}"
        )


def admin_activate_client_controller(client_id: str):
    try:
        response = activate_client_access(client_id)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to activate client access: {str(e)}"
        )


def admin_mark_help_post_solved_controller(post_id: str):
    try:
        response = mark_help_post_solved(post_id)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark help post as solved: {str(e)}"
        )


def admin_update_commit_status_controller(commit_id: str, status: str):
    try:
        response = update_commit_status(commit_id, status)
        return handle_service_response(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update commit status: {str(e)}"
        )