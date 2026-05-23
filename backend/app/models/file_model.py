from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FileModel(BaseModel):
    repo_id: str
    file_name: str
    file_path: str
    uploaded_by: str
    file_size: Optional[str] = None
    uploaded_at: datetime = datetime.utcnow()