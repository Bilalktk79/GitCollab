from pydantic import BaseModel
from typing import Optional


class ClientAccessCreate(BaseModel):
    # These are now optional because backend fills them from JWT.
    # Frontend may still send them for compatibility, but backend should not trust them.
    developer_id: Optional[str] = ""
    developer_name: Optional[str] = ""
    developer_role: Optional[str] = "developer"

    repo_id: Optional[str] = ""
    repo_name: str

    client_name: str
    client_email: Optional[str] = ""

    project_code: str


class ClientAccessLogin(BaseModel):
    client_name: str
    project_code: str


class ClientAccessResponse(BaseModel):
    success: bool
    message: str

    token: Optional[str] = None
    role: Optional[str] = None

    client_id: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None

    project_code: Optional[str] = None

    repo_id: Optional[str] = None
    repo_name: Optional[str] = None

    developer_id: Optional[str] = None
    developer_name: Optional[str] = None
    developer_role: Optional[str] = None