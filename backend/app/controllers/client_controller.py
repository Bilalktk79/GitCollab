from fastapi import HTTPException

from app.models.client_model import ClientAccessCreate, ClientAccessLogin
from app.services.client_service import (
    create_client_access,
    verify_client_access,
    get_all_client_access,
    get_client_access_by_code,
    deactivate_client_access,
    activate_client_access,
)


def create_client_access_controller(data: ClientAccessCreate, current_user: dict):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    current_role = current_user.get("role", "developer")

    if current_role not in ["developer", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only developer/admin users can create client invites"
        )

    if not data.repo_name.strip():
        raise HTTPException(status_code=400, detail="Repository name is required")

    if not data.client_name.strip():
        raise HTTPException(status_code=400, detail="Client name is required")

    if not data.project_code.strip():
        raise HTTPException(status_code=400, detail="Project code is required")

    # JWT is the single source of truth.
    # Do not trust developer_id/developer_name coming from frontend.
    data.developer_id = str(current_user.get("user_id"))
    data.developer_name = current_user.get("username")
    data.developer_role = current_role

    result = create_client_access(data)

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))

    return result


def verify_client_access_controller(data: ClientAccessLogin):
    if not data.client_name.strip():
        raise HTTPException(status_code=400, detail="Client name is required")

    if not data.project_code.strip():
        raise HTTPException(status_code=400, detail="Project access code is required")

    result = verify_client_access(data)

    if not result.get("success"):
        message = result.get("message", "Client access failed.")

        if "revoked" in message.lower() or "inactive" in message.lower():
            raise HTTPException(status_code=403, detail=message)

        raise HTTPException(status_code=401, detail=message)

    return result


def get_all_client_access_controller():
    return get_all_client_access()


def get_client_access_by_code_controller(project_code: str):
    record = get_client_access_by_code(project_code)

    if not record:
        raise HTTPException(status_code=404, detail="Client access code not found")

    return record


def deactivate_client_access_controller(access_id: str):
    record = deactivate_client_access(access_id)

    if not record:
        raise HTTPException(status_code=404, detail="Client access record not found")

    return {
        "success": True,
        "message": "Client access deactivated successfully.",
        "data": record,
    }


def activate_client_access_controller(access_id: str):
    record = activate_client_access(access_id)

    if not record:
        raise HTTPException(status_code=404, detail="Client access record not found")

    return {
        "success": True,
        "message": "Client access activated successfully.",
        "data": record,
    }