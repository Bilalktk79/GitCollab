from fastapi import APIRouter
from app.models.help_model import HelpPostCreate, HelpReplyCreate
from app.controllers.help_controller import (
    create_help_post_controller,
    get_all_help_posts_controller,
    get_help_post_controller,
    add_help_reply_controller,
    solve_help_post_controller,
)


router = APIRouter(prefix="/api/help", tags=["Help Room"])


@router.post("/create")
def create_help_post(data: HelpPostCreate):
    return create_help_post_controller(data)


@router.get("/all")
def get_all_help_posts():
    return get_all_help_posts_controller()


@router.get("/{post_id}")
def get_help_post(post_id: str):
    return get_help_post_controller(post_id)


@router.post("/{post_id}/reply")
def reply_to_help_post(post_id: str, data: HelpReplyCreate):
    return add_help_reply_controller(post_id, data)


@router.put("/{post_id}/solve")
def solve_help_post(post_id: str):
    return solve_help_post_controller(post_id)