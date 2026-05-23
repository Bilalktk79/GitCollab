from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserModel(BaseModel):
    username: str
    email: EmailStr
    password: str
    created_at: datetime = datetime.utcnow()