from fastapi import APIRouter, Header

from app.controllers.collaborator_controller import (
    fetch_collaborators,
    add_repo_collaborator,
    remove_repo_collaborator
)

router = APIRouter()


@router.get("/repos/{owner}/{repo}/collaborators")
def get_collaborators(owner: str, repo: str, authorization: str = Header(None)):
    return fetch_collaborators(owner, repo, authorization)


@router.post("/repos/{owner}/{repo}/collaborators")
def add_collaborator(
    owner: str,
    repo: str,
    collaborator_data: dict,
    authorization: str = Header(None)
):
    return add_repo_collaborator(owner, repo, collaborator_data, authorization)


@router.delete("/repos/{owner}/{repo}/collaborators/{username}")
def delete_collaborator(
    owner: str,
    repo: str,
    username: str,
    authorization: str = Header(None)
):
    return remove_repo_collaborator(owner, repo, username, authorization)