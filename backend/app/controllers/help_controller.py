from fastapi import HTTPException
from app.models.help_model import HelpPostCreate, HelpReplyCreate
from app.services.help_service import (
    create_help_post,
    get_all_help_posts,
    get_help_post_by_id,
    add_help_reply,
    mark_help_post_solved,
)


def create_help_post_controller(data: HelpPostCreate):
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="Issue title is required")

    if not data.repo_link.strip():
        raise HTTPException(status_code=400, detail="Repository link is required")

    if not data.description.strip():
        raise HTTPException(status_code=400, detail="Issue description is required")

    return create_help_post(data)


def get_all_help_posts_controller():
    return get_all_help_posts()


def get_help_post_controller(post_id: str):
    post = get_help_post_by_id(post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Help post not found")

    return post


def add_help_reply_controller(post_id: str, data: HelpReplyCreate):
    if not data.reply_message.strip():
        raise HTTPException(status_code=400, detail="Reply message cannot be empty")

    reply = add_help_reply(post_id, data)

    if not reply:
        raise HTTPException(status_code=404, detail="Help post not found")

    return reply


def solve_help_post_controller(post_id: str):
    post = mark_help_post_solved(post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Help post not found")

    return post