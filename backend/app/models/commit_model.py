from pydantic import BaseModel


class CommitModel(BaseModel):
    sha: str
    message: str
    author: str
    date: str