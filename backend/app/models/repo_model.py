from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RepoModel(BaseModel):
    repo_name: str
    description: Optional[str] = None
    visibility: str = "public"
    owner_id: str
    created_at: datetime = datetime.utcnow()