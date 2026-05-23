from pydantic import BaseModel
from typing import Optional


class ClientAccessCreate(BaseModel):
    developer_id: str
    developer_name: str
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
    project_code: Optional[str] = None
    repo_id: Optional[str] = None
    repo_name: Optional[str] = None
    developer_id: Optional[str] = None
    developer_name: Optional[str] = None