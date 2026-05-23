import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_API_URL = os.getenv("GITHUB_API_URL", "https://api.github.com")


def github_headers(token: str):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json"
    }


def get_user_repos(token: str):
    url = f"{GITHUB_API_URL}/user/repos?per_page=100"
    response = requests.get(url, headers=github_headers(token))
    return response.json(), response.status_code


def get_starred_repos(token: str):
    url = f"{GITHUB_API_URL}/user/starred?per_page=100"
    response = requests.get(url, headers=github_headers(token))
    return response.json(), response.status_code


def create_repo(token: str, repo_data: dict):
    url = f"{GITHUB_API_URL}/user/repos"

    payload = {
        "name": repo_data.get("name"),
        "description": repo_data.get("description", ""),
        "private": repo_data.get("private", False),
        "auto_init": True
    }

    response = requests.post(url, json=payload, headers=github_headers(token))
    return response.json(), response.status_code


def delete_repo(token: str, owner: str, repo: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}"
    response = requests.delete(url, headers=github_headers(token))

    if response.status_code == 204:
        return {"message": "Repository deleted successfully"}, 200

    return response.json(), response.status_code


def update_repo(token: str, owner: str, repo: str, repo_data: dict):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}"

    payload = {}

    if "name" in repo_data:
        payload["name"] = repo_data.get("name")

    if "description" in repo_data:
        payload["description"] = repo_data.get("description", "")

    if "private" in repo_data:
        payload["private"] = repo_data.get("private", False)

    response = requests.patch(
        url,
        json=payload,
        headers=github_headers(token)
    )

    try:
        return response.json(), response.status_code
    except Exception:
        return {"message": response.text}, response.status_code


def get_repo_commits(token: str, owner: str, repo: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/commits"
    response = requests.get(url, headers=github_headers(token))
    return response.json(), response.status_code


def get_repo_collaborators(token: str, owner: str, repo: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/collaborators"
    response = requests.get(url, headers=github_headers(token))
    return response.json(), response.status_code


def add_collaborator(token: str, owner: str, repo: str, username: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/collaborators/{username}"
    response = requests.put(url, headers=github_headers(token))

    if response.status_code in [201, 204]:
        return {
            "message": "Collaborator invitation sent successfully"
        }, response.status_code

    return response.json(), response.status_code


def remove_collaborator(token: str, owner: str, repo: str, username: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/collaborators/{username}"
    response = requests.delete(url, headers=github_headers(token))

    if response.status_code == 204:
        return {"message": "Collaborator removed successfully"}, 204

    return response.json(), response.status_code


def get_file_sha(token: str, owner: str, repo: str, file_path: str, branch: str = "main"):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{file_path}"

    response = requests.get(
        url,
        headers=github_headers(token),
        params={"ref": branch}
    )

    if response.status_code == 200:
        return response.json().get("sha")

    return None


def upload_file_to_repo(
    token: str,
    owner: str,
    repo: str,
    file_path: str,
    content: str,
    commit_message: str,
    branch: str = "main"
):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{file_path}"

    encoded_content = base64.b64encode(
        content.encode("utf-8")
    ).decode("utf-8")

    payload = {
        "message": commit_message,
        "content": encoded_content,
        "branch": branch
    }

    existing_sha = get_file_sha(
        token=token,
        owner=owner,
        repo=repo,
        file_path=file_path,
        branch=branch
    )

    if existing_sha:
        payload["sha"] = existing_sha

    response = requests.put(
        url,
        json=payload,
        headers=github_headers(token)
    )

    try:
        data = response.json()
    except Exception:
        data = {"message": response.text}

    if response.status_code not in [200, 201]:
        return data, response.status_code

    commit_data = data.get("commit", {})
    commit_sha = commit_data.get("sha")

    enhanced_response = {
        "success": True,
        "message": "File uploaded/updated successfully on GitHub",
        "commit_sha": commit_sha,
        "commit_message": commit_data.get("message", commit_message),
        "file_path": file_path,
        "branch": branch,
        "owner": owner,
        "repo_name": repo,
        "github_response": data
    }

    return enhanced_response, response.status_code