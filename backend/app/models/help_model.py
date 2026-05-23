from pydantic import BaseModel
from typing import Optional


class HelpPostCreate(BaseModel):
    developer_id: str
    developer_name: str
    title: str
    repo_link: str
    file_path: Optional[str] = ""
    commit_id: Optional[str] = ""
    issue_type: str
    error_message: Optional[str] = ""
    description: str
    code_snippet: Optional[str] = ""


class HelpReplyCreate(BaseModel):
    sender_id: str
    sender_name: str
    reply_message: str
    code_snippet: Optional[str] = ""