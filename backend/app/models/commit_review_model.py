from pydantic import BaseModel, Field
from typing import List, Optional


class ChangedFileModel(BaseModel):
    name: str
    type: Optional[str] = "Modified"
    description: Optional[str] = ""


class CommitReviewCreate(BaseModel):
    commit_id: str
    repo_id: Optional[str] = ""
    repo_name: str
    repo_link: Optional[str] = ""
    developer_id: Optional[str] = ""
    developer_name: str
    branch: Optional[str] = "main"
    message: str
    changed_files: List[ChangedFileModel] = Field(default_factory=list)
    status: Optional[str] = "Pending Review"
    feedback: Optional[str] = ""
    priority: Optional[str] = "Medium"
    commit_type: Optional[str] = "General"
    summary: Optional[str] = ""


class CommitStatusUpdate(BaseModel):
    status: str
    feedback: Optional[str] = ""