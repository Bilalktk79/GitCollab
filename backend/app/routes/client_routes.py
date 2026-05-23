from fastapi import APIRouter

from app.models.client_model import ClientAccessCreate, ClientAccessLogin

from app.controllers.client_controller import (
    create_client_access_controller,
    verify_client_access_controller,
    get_all_client_access_controller,
    get_client_access_by_code_controller,
    deactivate_client_access_controller,
    activate_client_access_controller,
)


router = APIRouter(
    prefix="/api/client",
    tags=["Client Access"]
)


@router.post("/create-access")
def create_client_access(data: ClientAccessCreate):
    return create_client_access_controller(data)


@router.post("/access")
def client_access_login(data: ClientAccessLogin):
    return verify_client_access_controller(data)


@router.get("/all")
def get_all_client_access():
    return get_all_client_access_controller()


@router.get("/code/{project_code}")
def get_client_access_by_code(project_code: str):
    return get_client_access_by_code_controller(project_code)


@router.put("/deactivate/{access_id}")
def deactivate_client_access(access_id: str):
    return deactivate_client_access_controller(access_id)


@router.put("/activate/{access_id}")
def activate_client_access(access_id: str):
    return activate_client_access_controller(access_id)