from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os

from app.models.client_model import ClientAccessCreate, ClientAccessLogin

from app.controllers.client_controller import (
    create_client_access_controller,
    verify_client_access_controller,
    get_all_client_access_controller,
    get_client_access_by_code_controller,
    deactivate_client_access_controller,
    activate_client_access_controller,
)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

security = HTTPBearer()

router = APIRouter(
    prefix="/api/client",
    tags=["Client Access"]
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")
        username = payload.get("username")
        role = payload.get("role", "developer")

        if not user_id or not username:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        return {
            "user_id": user_id,
            "username": username,
            "role": role,
            "email": payload.get("email"),
            "auth_provider": payload.get("auth_provider"),
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )


def require_developer_or_admin(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")

    if role not in ["developer", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only developer/admin users can perform this action."
        )

    return current_user


@router.post("/create-access")
def create_client_access(
    data: ClientAccessCreate,
    current_user: dict = Depends(require_developer_or_admin)
):
    return create_client_access_controller(data, current_user)


@router.post("/access")
def client_access_login(data: ClientAccessLogin):
    return verify_client_access_controller(data)


@router.get("/all")
def get_all_client_access(
    current_user: dict = Depends(require_developer_or_admin)
):
    return get_all_client_access_controller()


@router.get("/code/{project_code}")
def get_client_access_by_code(
    project_code: str,
    current_user: dict = Depends(require_developer_or_admin)
):
    return get_client_access_by_code_controller(project_code)


@router.put("/deactivate/{access_id}")
def deactivate_client_access(
    access_id: str,
    current_user: dict = Depends(require_developer_or_admin)
):
    return deactivate_client_access_controller(access_id)


@router.put("/activate/{access_id}")
def activate_client_access(
    access_id: str,
    current_user: dict = Depends(require_developer_or_admin)
):
    return activate_client_access_controller(access_id)