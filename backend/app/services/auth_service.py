from fastapi import HTTPException
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import requests

from app.database.db import users_collection

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def check_user_blocked(user):
    """
    Agar admin ne user ko block kiya hai to login deny hoga.
    Ye check local login, GitHub OAuth, aur PAT login teenon mein use hoga.
    """

    if user and user.get("is_blocked") is True:
        raise HTTPException(
            status_code=403,
            detail="Your account has been blocked by admin."
        )


def register_user(user):
    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "auth_provider": "local",
        "github_id": None,
        "github_access_token": None,
        "role": "developer",
        "is_blocked": False,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(new_user)

    return {"message": "User registered successfully"}


def login_user(data: dict):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    check_user_blocked(user)

    if user.get("auth_provider") == "github" and not user.get("password"):
        raise HTTPException(
            status_code=400,
            detail="This account uses GitHub login"
        )

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "role": user.get("role", "developer"),
        "auth_provider": user.get("auth_provider", "local")
    })

    return {
        "message": "Login successful",
        "token": token,
        "username": user["username"],
        "role": user.get("role", "developer")
    }


def get_github_login_url():
    return (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=repo user read:user user:email delete_repo"
    )


def exchange_code_for_github_token(code: str):
    token_url = "https://github.com/login/oauth/access_token"

    payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI
    }

    headers = {"Accept": "application/json"}

    response = requests.post(token_url, json=payload, headers=headers)
    data = response.json()

    github_token = data.get("access_token")

    if not github_token:
        raise HTTPException(
            status_code=400,
            detail=data.get("error_description", "GitHub token not received")
        )

    return github_token


def get_github_user(github_token: str):
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github+json"
    }

    response = requests.get("https://api.github.com/user", headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid GitHub Token")

    return response.json(), response.headers


def check_github_scopes(headers):
    scopes = headers.get("X-OAuth-Scopes", "")

    # Fine-grained GitHub PAT me kabhi scopes header empty hota he
    # Isliye direct reject nahi karenge
    if scopes == "":
        return

    required_scopes = ["repo"]
    missing_scopes = []

    for scope in required_scopes:
        if scope not in scopes:
            missing_scopes.append(scope)

    if missing_scopes:
        raise HTTPException(
            status_code=403,
            detail=f"Missing GitHub scopes: {', '.join(missing_scopes)}"
        )


def save_or_update_github_user(github_user, github_token):
    github_id = github_user.get("id")
    username = github_user.get("login")
    email = github_user.get("email")

    if not github_id or not username:
        raise HTTPException(status_code=400, detail="Invalid GitHub user data")

    if not email:
        email = f"{username}@github.local"

    existing_user = users_collection.find_one({"github_id": github_id})

    if existing_user:
        check_user_blocked(existing_user)

        users_collection.update_one(
            {"github_id": github_id},
            {
                "$set": {
                    "username": username,
                    "email": email,
                    "github_access_token": github_token,
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "role": "developer",
                    "is_blocked": False
                }
            }
        )

        user_id = str(existing_user["_id"])
        role = existing_user.get("role", "developer")

    else:
        new_user = {
            "username": username,
            "email": email,
            "password": None,
            "github_id": github_id,
            "github_access_token": github_token,
            "auth_provider": "github",
            "role": "developer",
            "is_blocked": False,
            "created_at": datetime.utcnow()
        }

        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        role = "developer"

    app_token = create_access_token({
        "user_id": user_id,
        "email": email,
        "username": username,
        "role": role,
        "auth_provider": "github"
    })

    return {
        "message": "GitHub Login Successful",
        "token": app_token,
        "github_token": github_token,
        "username": username,
        "github_id": github_id,
        "role": role
    }


def github_auth_callback(code: str):
    github_token = exchange_code_for_github_token(code)

    github_user, headers = get_github_user(github_token)

    check_github_scopes(headers)

    data = save_or_update_github_user(github_user, github_token)

    return {
        "frontend_url": FRONTEND_URL,
        "token": data["token"],
        "github_token": data["github_token"],
        "username": data["username"],
        "role": data.get("role", "developer")
    }


def github_token_login(data: dict):
    github_token = data.get("token")

    if not github_token:
        raise HTTPException(status_code=400, detail="GitHub token is required")

    github_user, headers = get_github_user(github_token)

    check_github_scopes(headers)

    return save_or_update_github_user(github_user, github_token)