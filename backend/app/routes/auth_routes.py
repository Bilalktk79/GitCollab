from fastapi import APIRouter
from app.models.user_model import UserModel
from app.controllers.auth_controller import (
    signup_controller,
    login_controller,
    github_login_controller,
    github_callback_controller,
    github_token_login_controller
)

router = APIRouter()


@router.post("/signup")
def signup(user: UserModel):
    return signup_controller(user)


@router.post("/login")
def login(data: dict):
    return login_controller(data)


@router.get("/github/login")
def github_login():
    return github_login_controller()


@router.get("/github/callback")
def github_callback(code: str):
    return github_callback_controller(code)


@router.post("/github/token-login")
def github_token_login(data: dict):
    return github_token_login_controller(data)