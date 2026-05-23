from pydantic import BaseModel
from typing import Optional


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str  # chat, help_reply, commit_review
    related_id: Optional[str] = None