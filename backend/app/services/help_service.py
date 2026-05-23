from datetime import datetime
from bson import ObjectId
from app.database.db import db
from app.services.notification_service import create_notification


help_posts_collection = db["help_posts"]
help_replies_collection = db["help_replies"]


def serialize_reply(reply):
    return {
        "id": str(reply["_id"]),
        "help_post_id": reply.get("help_post_id"),
        "sender_id": reply.get("sender_id"),
        "sender_name": reply.get("sender_name"),
        "reply_message": reply.get("reply_message"),
        "code_snippet": reply.get("code_snippet"),
        "created_at": reply.get("created_at"),
    }


def serialize_help_post(post):
    replies = list(
        help_replies_collection.find(
            {"help_post_id": str(post["_id"])}
        ).sort("created_at", 1)
    )

    return {
        "id": str(post["_id"]),
        "developer_id": post.get("developer_id"),
        "developer_name": post.get("developer_name"),
        "title": post.get("title"),
        "repo_link": post.get("repo_link"),
        "file_path": post.get("file_path"),
        "commit_id": post.get("commit_id"),
        "issue_type": post.get("issue_type"),
        "error_message": post.get("error_message"),
        "description": post.get("description"),
        "code_snippet": post.get("code_snippet"),
        "status": post.get("status", "Open"),
        "created_at": post.get("created_at"),
        "replies": [serialize_reply(reply) for reply in replies],
    }


def create_help_post(data):
    post = {
        "developer_id": data.developer_id,
        "developer_name": data.developer_name,
        "title": data.title,
        "repo_link": data.repo_link,
        "file_path": data.file_path,
        "commit_id": data.commit_id,
        "issue_type": data.issue_type,
        "error_message": data.error_message,
        "description": data.description,
        "code_snippet": data.code_snippet,
        "status": "Open",
        "created_at": datetime.utcnow(),
    }

    result = help_posts_collection.insert_one(post)
    post["_id"] = result.inserted_id

    return serialize_help_post(post)


def get_all_help_posts():
    posts = help_posts_collection.find().sort("created_at", -1)

    return [serialize_help_post(post) for post in posts]


def get_help_post_by_id(post_id: str):
    if not ObjectId.is_valid(post_id):
        return None

    post = help_posts_collection.find_one(
        {"_id": ObjectId(post_id)}
    )

    if not post:
        return None

    return serialize_help_post(post)


def add_help_reply(post_id: str, data):
    if not ObjectId.is_valid(post_id):
        return None

    post = help_posts_collection.find_one(
        {"_id": ObjectId(post_id)}
    )

    if not post:
        return None

    reply = {
        "help_post_id": post_id,
        "sender_id": data.sender_id,
        "sender_name": data.sender_name,
        "reply_message": data.reply_message,
        "code_snippet": data.code_snippet,
        "created_at": datetime.utcnow(),
    }

    result = help_replies_collection.insert_one(reply)
    reply["_id"] = result.inserted_id

    create_notification({
        "user_id": post.get("developer_id"),
        "title": "New Help Reply",
        "message": f"{data.sender_name} replied to your issue: {post.get('title')}",
        "type": "help_reply",
        "related_id": post_id,
    })

    return serialize_reply(reply)


def mark_help_post_solved(post_id: str):
    if not ObjectId.is_valid(post_id):
        return None

    help_posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"status": "Solved"}}
    )

    post = help_posts_collection.find_one(
        {"_id": ObjectId(post_id)}
    )

    if not post:
        return None

    return serialize_help_post(post)