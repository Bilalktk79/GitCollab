from pydantic import BaseModel


class CollaboratorModel(BaseModel):
    username: str
    avatar_url: str | None = None
    profile_url: str | None = None
    role: str = "collaborator"