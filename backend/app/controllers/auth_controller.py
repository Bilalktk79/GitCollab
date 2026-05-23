from fastapi import HTTPException
from fastapi.responses import RedirectResponse
import os

from app.services.auth_service import (
    register_user,
    login_user,
    get_github_login_url,
    github_auth_callback,
    github_token_login
)


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def signup_controller(user):
    try:
        return register_user(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Signup failed: {str(e)}"
        )


def login_controller(data: dict):
    try:
        return login_user(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )


def github_login_controller():
    try:
        github_url = get_github_login_url()
        return RedirectResponse(github_url)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start GitHub login: {str(e)}"
        )


def github_callback_controller(code: str):
    try:
        data = github_auth_callback(code)

        frontend_url = data.get("frontend_url") or FRONTEND_URL

        redirect_url = (
            f"{frontend_url}/auth/callback"
            f"?token={data['token']}"
            f"&github_token={data['github_token']}"
            f"&username={data['username']}"
            f"&role={data.get('role', 'developer')}"
        )

        return RedirectResponse(redirect_url)

    except HTTPException as e:
        # Agar GitHub OAuth user blocked ho ya auth error aaye,
        # frontend login page par readable error bhej do.
        error_message = e.detail or "GitHub login failed."

        redirect_url = (
            f"{FRONTEND_URL}/login"
            f"?error={error_message}"
        )

        return RedirectResponse(redirect_url)

    except Exception as e:
        redirect_url = (
            f"{FRONTEND_URL}/login"
            f"?error=GitHub callback failed: {str(e)}"
        )

        return RedirectResponse(redirect_url)


def github_token_login_controller(data: dict):
    try:
        return github_token_login(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"GitHub token login failed: {str(e)}"
        )