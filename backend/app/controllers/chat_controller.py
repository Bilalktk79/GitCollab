from fastapi import HTTPException
from app.models.chat_model import ChatMessageCreate
from app.services.chat_service import (
    send_chat_message,
    get_conversation,
    get_commit_messages,
    get_user_conversations,
    mark_message_read,
)


def create_message_controller(data: ChatMessageCreate):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    return send_chat_message(data)


def get_conversation_controller(user1_id: str, user2_id: str, repo_id: str = None, commit_id: str = None):
    return get_conversation(user1_id, user2_id, repo_id, commit_id)


def get_commit_messages_controller(commit_id: str):
    return get_commit_messages(commit_id)


def get_user_conversations_controller(user_id: str):
    return get_user_conversations(user_id)


def mark_message_read_controller(message_id: str):
    message = mark_message_read(message_id)

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    return message