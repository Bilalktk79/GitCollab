from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatMessageCreate(BaseModel):
    sender_id: str
    sender_name: str
    sender_role: str  # developer or client
    receiver_id: str
    receiver_name: Optional[str] = None
    repo_id: Optional[str] = None
    repo_name: Optional[str] = None
    commit_id: Optional[str] = None
    message: str


class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_role: str
    receiver_id: str
    receiver_name: Optional[str] = None
    repo_id: Optional[str] = None
    repo_name: Optional[str] = None
    commit_id: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime