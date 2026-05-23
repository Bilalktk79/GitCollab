from fastapi import Header, HTTPException
from fastapi.responses import JSONResponse

from app.controllers.github_controller import extract_token
from app.services.github_service import (
    get_repo_collaborators,
    add_collaborator,
    remove_collaborator
)


def fetch_collaborators(owner: str, repo: str, authorization: str = Header(None)):
    token = extract_token(authorization)

    data, status_code = get_repo_collaborators(token, owner, repo)
    return JSONResponse(content=data, status_code=status_code)


def add_repo_collaborator(
    owner: str,
    repo: str,
    collaborator_data: dict,
    authorization: str = Header(None)
):
    token = extract_token(authorization)

    username = collaborator_data.get("username")

    if not username:
        raise HTTPException(status_code=400, detail="GitHub username is required")

    data, status_code = add_collaborator(token, owner, repo, username)
    return JSONResponse(content=data, status_code=status_code)


def remove_repo_collaborator(
    owner: str,
    repo: str,
    username: str,
    authorization: str = Header(None)
):
    token = extract_token(authorization)

    data, status_code = remove_collaborator(token, owner, repo, username)
    return JSONResponse(content=data, status_code=status_code)