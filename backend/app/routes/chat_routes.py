from fastapi import APIRouter, Query
from app.models.chat_model import ChatMessageCreate
from app.controllers.chat_controller import (
    create_message_controller,
    get_conversation_controller,
    get_commit_messages_controller,
    get_user_conversations_controller,
    mark_message_read_controller,
)


router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/send")
def send_message(data: ChatMessageCreate):
    return create_message_controller(data)


@router.get("/conversation")
def get_conversation(
    user1_id: str = Query(...),
    user2_id: str = Query(...),
    repo_id: str = Query(None),
    commit_id: str = Query(None),
):
    return get_conversation_controller(user1_id, user2_id, repo_id, commit_id)


@router.get("/commit/{commit_id}")
def get_commit_chat(commit_id: str):
    return get_commit_messages_controller(commit_id)


@router.get("/conversations/{user_id}")
def get_user_conversations(user_id: str):
    return get_user_conversations_controller(user_id)


@router.put("/read/{message_id}")
def read_message(message_id: str):
    return mark_message_read_controller(message_id)