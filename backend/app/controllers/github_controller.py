from fastapi import HTTPException
from fastapi.responses import JSONResponse

from app.services.github_service import (
    get_user_repos,
    get_starred_repos,
    create_repo,
    delete_repo,
    update_repo,
    upload_file_to_repo,
)

from app.services.commit_review_service import create_commit_review


def extract_token(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="GitHub token missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    return authorization.replace("Bearer ", "").strip()


def fetch_repositories(authorization: str):
    token = extract_token(authorization)
    data, status_code = get_user_repos(token)
    return JSONResponse(content=data, status_code=status_code)


def fetch_starred_repositories(authorization: str):
    token = extract_token(authorization)
    data, status_code = get_starred_repos(token)
    return JSONResponse(content=data, status_code=status_code)


def create_github_repository(repo_data: dict, authorization: str):
    token = extract_token(authorization)

    if not repo_data.get("name"):
        raise HTTPException(status_code=400, detail="Repository name is required")

    data, status_code = create_repo(token, repo_data)
    return JSONResponse(content=data, status_code=status_code)


def delete_github_repository(owner: str, repo: str, authorization: str):
    token = extract_token(authorization)
    data, status_code = delete_repo(token, owner, repo)
    return JSONResponse(content=data, status_code=status_code)


def update_github_repository(owner: str, repo: str, repo_data: dict, authorization: str):
    token = extract_token(authorization)

    payload = {}

    if "name" in repo_data:
        if not repo_data.get("name"):
            raise HTTPException(status_code=400, detail="Repository name is required")
        payload["name"] = repo_data.get("name")

    if "description" in repo_data:
        payload["description"] = repo_data.get("description")

    if "private" in repo_data:
        payload["private"] = repo_data.get("private")

    if not payload:
        raise HTTPException(status_code=400, detail="No update data provided")

    data, status_code = update_repo(token, owner, repo, payload)
    return JSONResponse(content=data, status_code=status_code)


def upload_github_file(owner: str, repo: str, upload_data, authorization: str):
    """
    Ye function:
    1. GitHub repo mein file upload/update karega
    2. GitHub response se commit SHA lega
    3. MongoDB commit_reviews collection mein Pending Review record create karega
    """

    token = extract_token(authorization)

    github_data, status_code = upload_file_to_repo(
        token=token,
        owner=owner,
        repo=repo,
        file_path=upload_data.file_path,
        content=upload_data.content,
        commit_message=upload_data.commit_message,
        branch=upload_data.branch or "main",
    )

    if status_code not in [200, 201]:
        return JSONResponse(content=github_data, status_code=status_code)

    commit_sha = github_data.get("commit_sha")

    if not commit_sha:
        raise HTTPException(
            status_code=500,
            detail="GitHub upload successful but commit SHA not found"
        )

    developer_id = getattr(upload_data, "developer_id", "") or owner
    developer_name = getattr(upload_data, "developer_name", "") or owner
    branch = upload_data.branch or "main"

    commit_review = create_commit_review({
        "commit_id": commit_sha,
        "repo_id": f"{owner}/{repo}",
        "repo_name": repo,
        "repo_link": f"https://github.com/{owner}/{repo}",
        "developer_id": developer_id,
        "developer_name": developer_name,
        "branch": branch,
        "message": upload_data.commit_message,
        "changed_files": [
            {
                "name": upload_data.file_path,
                "type": "Modified",
                "description": f"{upload_data.file_path} uploaded/updated from GitCollab Upload File page"
            }
        ],
        "status": "Pending Review",
        "feedback": "",
        "priority": "Medium",
        "commit_type": "File Upload",
        "summary": f"File {upload_data.file_path} uploaded/updated in {repo}"
    })

    response_data = {
        "success": True,
        "message": "File uploaded to GitHub and commit review created successfully",
        "github_upload": github_data,
        "commit_review": commit_review,
    }

    return JSONResponse(content=response_data, status_code=status_code)