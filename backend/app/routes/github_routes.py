from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional

from app.controllers.github_controller import (
    fetch_repositories,
    fetch_starred_repositories,
    create_github_repository,
    delete_github_repository,
    update_github_repository,
    upload_github_file,
)

router = APIRouter()


class FileUploadRequest(BaseModel):
    file_path: str
    content: str
    commit_message: str
    branch: Optional[str] = "main"
    developer_id: Optional[str] = ""
    developer_name: Optional[str] = ""


def get_auth_header(request: Request):
    return request.headers.get("Authorization") or request.headers.get("authorization")


@router.get("/repos")
def get_repos(request: Request):
    authorization = get_auth_header(request)
    return fetch_repositories(authorization)


@router.get("/repos/starred")
def get_starred(request: Request):
    authorization = get_auth_header(request)
    return fetch_starred_repositories(authorization)


@router.post("/repos/create")
def create_repo(repo_data: dict, request: Request):
    authorization = get_auth_header(request)
    return create_github_repository(repo_data, authorization)


@router.delete("/repos/{owner}/{repo}")
def delete_repo(owner: str, repo: str, request: Request):
    authorization = get_auth_header(request)
    return delete_github_repository(owner, repo, authorization)


@router.patch("/repos/{owner}/{repo}")
def update_repo(owner: str, repo: str, repo_data: dict, request: Request):
    authorization = get_auth_header(request)
    return update_github_repository(owner, repo, repo_data, authorization)


@router.post("/repos/{owner}/{repo}/upload")
def upload_file(owner: str, repo: str, upload_data: FileUploadRequest, request: Request):
    authorization = get_auth_header(request)
    return upload_github_file(owner, repo, upload_data, authorization)