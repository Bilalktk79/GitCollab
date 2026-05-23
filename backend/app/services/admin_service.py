from datetime import datetime
from bson import ObjectId
from app.database.db import db


# Existing collections
users_collection = db["users"]
repositories_collection = db["repositories"]
files_collection = db["files"]
commit_reviews_collection = db["commit_reviews"]
client_access_collection = db["client_access"]
help_posts_collection = db["help_posts"]
help_replies_collection = db["help_replies"]
chat_messages_collection = db["chat_messages"]
notifications_collection = db["notifications"]

# Admin Logs Collection
admin_logs_collection = db["admin_logs"]


SENSITIVE_FIELDS = {
    "password",
    "hashed_password",
    "github_token",
    "access_token",
    "client_token",
    "token",
    "refresh_token",
}


VALID_COMMIT_STATUSES = {
    "Pending Review",
    "Approved",
    "Changes Requested",
}


def safe_serialize(doc):
    """
    MongoDB document ko JSON-safe banata hai.
    ObjectId aur datetime convert karta hai.
    Sensitive fields remove karta hai.
    """

    if doc is None:
        return None

    serialized = {}

    for key, value in doc.items():
        if key in SENSITIVE_FIELDS:
            continue

        if key == "_id":
            serialized["id"] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, list):
            serialized[key] = [
                safe_serialize(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, dict):
            serialized[key] = safe_serialize(value)
        else:
            serialized[key] = value

    return serialized


def is_valid_object_id(item_id: str):
    """
    MongoDB ObjectId validate karta hai.
    """

    return ObjectId.is_valid(item_id)


def get_object_id(item_id: str):
    """
    String id ko ObjectId mein convert karta hai.
    """

    if not is_valid_object_id(item_id):
        return None

    return ObjectId(item_id)


def get_collection_count(collection):
    try:
        return collection.count_documents({})
    except Exception:
        return 0


def get_status_count(status):
    try:
        return commit_reviews_collection.count_documents({"status": status})
    except Exception:
        return 0


# ==========================================================
# Admin Logs Helpers
# ==========================================================

def create_admin_log(
    action_type: str,
    target_type: str,
    target_id: str,
    description: str,
    admin_id: str = "system-admin",
    admin_name: str = "Admin",
    extra_data: dict | None = None,
):
    """
    Admin action ka log save karta hai.
    Abhi admin authentication fully protected nahi hai,
    is liye default admin_id/admin_name use ho rahe hain.
    Baad mein real admin token se admin_id/admin_name pass kar sakte hain.
    """

    try:
        log_doc = {
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action_type": action_type,
            "target_type": target_type,
            "target_id": str(target_id),
            "description": description,
            "extra_data": extra_data or {},
            "created_at": datetime.utcnow(),
        }

        admin_logs_collection.insert_one(log_doc)

        return {
            "success": True,
            "message": "Admin log created successfully.",
        }

    except Exception as e:
        # Log failure ki wajah se main admin action fail nahi hona chahiye
        print(f"[Admin Log Error] {str(e)}")

        return {
            "success": False,
            "message": "Failed to create admin log.",
        }


def get_admin_logs(limit: int = 100):
    """
    Admin logs list return karta hai.
    Latest logs pehle show honge.
    """

    logs = list(
        admin_logs_collection.find()
        .sort("created_at", -1)
        .limit(limit)
    )

    safe_logs = [
        safe_serialize(log)
        for log in logs
    ]

    return {
        "success": True,
        "count": len(safe_logs),
        "logs": safe_logs,
    }


# ==========================================================
# Admin Dashboard + Lists
# ==========================================================

def get_admin_dashboard_stats():
    """
    Admin dashboard ke cards + recent data.
    """

    total_users = get_collection_count(users_collection)
    total_repositories = get_collection_count(repositories_collection)
    total_files = get_collection_count(files_collection)
    total_commit_reviews = get_collection_count(commit_reviews_collection)
    total_client_access = get_collection_count(client_access_collection)
    total_help_posts = get_collection_count(help_posts_collection)
    total_help_replies = get_collection_count(help_replies_collection)
    total_chats = get_collection_count(chat_messages_collection)
    total_notifications = get_collection_count(notifications_collection)
    total_admin_logs = get_collection_count(admin_logs_collection)

    pending_reviews = get_status_count("Pending Review")
    approved_commits = get_status_count("Approved")
    changes_requested = get_status_count("Changes Requested")

    recent_commits = list(
        commit_reviews_collection.find().sort("created_at", -1).limit(5)
    )

    recent_clients = list(
        client_access_collection.find().sort("created_at", -1).limit(5)
    )

    recent_help_posts = list(
        help_posts_collection.find().sort("created_at", -1).limit(5)
    )

    recent_admin_logs = list(
        admin_logs_collection.find().sort("created_at", -1).limit(5)
    )

    return {
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_repositories": total_repositories,
            "total_files": total_files,
            "total_commit_reviews": total_commit_reviews,
            "pending_reviews": pending_reviews,
            "approved_commits": approved_commits,
            "changes_requested": changes_requested,
            "total_client_access": total_client_access,
            "total_help_posts": total_help_posts,
            "total_help_replies": total_help_replies,
            "total_chats": total_chats,
            "total_notifications": total_notifications,
            "total_admin_logs": total_admin_logs,
        },
        "recent_commits": [
            safe_serialize(commit) for commit in recent_commits
        ],
        "recent_clients": [
            safe_serialize(client) for client in recent_clients
        ],
        "recent_help_posts": [
            safe_serialize(post) for post in recent_help_posts
        ],
        "recent_admin_logs": [
            safe_serialize(log) for log in recent_admin_logs
        ],
    }


def get_admin_users():
    users = list(users_collection.find().sort("created_at", -1))

    safe_users = [
        safe_serialize(user)
        for user in users
    ]

    return {
        "success": True,
        "count": len(safe_users),
        "users": safe_users,
    }


def get_admin_repositories():
    repos = list(repositories_collection.find().sort("created_at", -1))

    safe_repos = [
        safe_serialize(repo)
        for repo in repos
    ]

    return {
        "success": True,
        "count": len(safe_repos),
        "repositories": safe_repos,
    }


def get_admin_commit_reviews():
    commits = list(commit_reviews_collection.find().sort("created_at", -1))

    safe_commits = [
        safe_serialize(commit)
        for commit in commits
    ]

    return {
        "success": True,
        "count": len(safe_commits),
        "commits": safe_commits,
    }


def get_admin_client_access():
    clients = list(client_access_collection.find().sort("created_at", -1))

    safe_clients = [
        safe_serialize(client)
        for client in clients
    ]

    return {
        "success": True,
        "count": len(safe_clients),
        "clients": safe_clients,
    }


def get_admin_help_posts():
    posts = list(help_posts_collection.find().sort("created_at", -1))

    safe_posts = [
        safe_serialize(post)
        for post in posts
    ]

    return {
        "success": True,
        "count": len(safe_posts),
        "help_posts": safe_posts,
    }


def get_admin_notifications():
    notifications = list(
        notifications_collection.find().sort("created_at", -1).limit(50)
    )

    safe_notifications = [
        safe_serialize(notification)
        for notification in notifications
    ]

    return {
        "success": True,
        "count": len(safe_notifications),
        "notifications": safe_notifications,
    }


# ==========================================================
# Admin Actions
# ==========================================================

def block_user(user_id: str):
    """
    Admin kisi user ko block kar sakta hai.
    users collection mein is_blocked = True set hoga.
    """

    object_id = get_object_id(user_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid user id.",
        }

    user = users_collection.find_one({"_id": object_id})

    if not user:
        return {
            "success": False,
            "message": "User not found.",
        }

    users_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_blocked": True,
                "blocked_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_user = users_collection.find_one({"_id": object_id})

    username = (
        updated_user.get("username")
        or updated_user.get("name")
        or updated_user.get("email")
        or str(user_id)
    )

    create_admin_log(
        action_type="USER_BLOCKED",
        target_type="user",
        target_id=user_id,
        description=f"Admin blocked user: {username}",
        extra_data={
            "user_id": user_id,
            "username": username,
            "email": updated_user.get("email"),
        },
    )

    return {
        "success": True,
        "message": "User blocked successfully.",
        "user": safe_serialize(updated_user),
    }


def unblock_user(user_id: str):
    """
    Admin kisi blocked user ko unblock kar sakta hai.
    users collection mein is_blocked = False set hoga.
    """

    object_id = get_object_id(user_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid user id.",
        }

    user = users_collection.find_one({"_id": object_id})

    if not user:
        return {
            "success": False,
            "message": "User not found.",
        }

    users_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_blocked": False,
                "unblocked_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_user = users_collection.find_one({"_id": object_id})

    username = (
        updated_user.get("username")
        or updated_user.get("name")
        or updated_user.get("email")
        or str(user_id)
    )

    create_admin_log(
        action_type="USER_UNBLOCKED",
        target_type="user",
        target_id=user_id,
        description=f"Admin unblocked user: {username}",
        extra_data={
            "user_id": user_id,
            "username": username,
            "email": updated_user.get("email"),
        },
    )

    return {
        "success": True,
        "message": "User unblocked successfully.",
        "user": safe_serialize(updated_user),
    }


def revoke_client_access(client_id: str):
    """
    Admin client access revoke kar sakta hai.
    client_access collection mein is_active = False set hoga.
    """

    object_id = get_object_id(client_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid client access id.",
        }

    client = client_access_collection.find_one({"_id": object_id})

    if not client:
        return {
            "success": False,
            "message": "Client access record not found.",
        }

    client_access_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_active": False,
                "revoked_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_client = client_access_collection.find_one({"_id": object_id})

    client_name = (
        updated_client.get("client_name")
        or updated_client.get("project_code")
        or str(client_id)
    )

    create_admin_log(
        action_type="CLIENT_ACCESS_REVOKED",
        target_type="client_access",
        target_id=client_id,
        description=f"Admin revoked client access: {client_name}",
        extra_data={
            "client_id": client_id,
            "client_name": updated_client.get("client_name"),
            "project_code": updated_client.get("project_code"),
            "repo_name": updated_client.get("repo_name"),
            "developer_name": updated_client.get("developer_name"),
        },
    )

    return {
        "success": True,
        "message": "Client access revoked successfully.",
        "client": safe_serialize(updated_client),
    }


def activate_client_access(client_id: str):
    """
    Admin revoked client access ko dobara activate kar sakta hai.
    client_access collection mein is_active = True set hoga.
    """

    object_id = get_object_id(client_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid client access id.",
        }

    client = client_access_collection.find_one({"_id": object_id})

    if not client:
        return {
            "success": False,
            "message": "Client access record not found.",
        }

    client_access_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "is_active": True,
                "activated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_client = client_access_collection.find_one({"_id": object_id})

    client_name = (
        updated_client.get("client_name")
        or updated_client.get("project_code")
        or str(client_id)
    )

    create_admin_log(
        action_type="CLIENT_ACCESS_ACTIVATED",
        target_type="client_access",
        target_id=client_id,
        description=f"Admin activated client access: {client_name}",
        extra_data={
            "client_id": client_id,
            "client_name": updated_client.get("client_name"),
            "project_code": updated_client.get("project_code"),
            "repo_name": updated_client.get("repo_name"),
            "developer_name": updated_client.get("developer_name"),
        },
    )

    return {
        "success": True,
        "message": "Client access activated successfully.",
        "client": safe_serialize(updated_client),
    }


def mark_help_post_solved(post_id: str):
    """
    Admin help post ko solved mark kar sakta hai.
    help_posts collection mein status = Solved set hoga.
    """

    object_id = get_object_id(post_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid help post id.",
        }

    post = help_posts_collection.find_one({"_id": object_id})

    if not post:
        return {
            "success": False,
            "message": "Help post not found.",
        }

    help_posts_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": "Solved",
                "solved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_post = help_posts_collection.find_one({"_id": object_id})

    post_title = updated_post.get("title") or str(post_id)

    create_admin_log(
        action_type="HELP_POST_SOLVED",
        target_type="help_post",
        target_id=post_id,
        description=f"Admin marked help post as solved: {post_title}",
        extra_data={
            "post_id": post_id,
            "title": updated_post.get("title"),
            "developer_name": updated_post.get("developer_name"),
            "issue_type": updated_post.get("issue_type"),
            "repo_link": updated_post.get("repo_link"),
        },
    )

    return {
        "success": True,
        "message": "Help post marked as solved successfully.",
        "help_post": safe_serialize(updated_post),
    }


def update_commit_status(commit_id: str, status: str):
    """
    Admin commit review ka status update kar sakta hai.
    Allowed statuses:
    - Pending Review
    - Approved
    - Changes Requested
    """

    object_id = get_object_id(commit_id)

    if object_id is None:
        return {
            "success": False,
            "message": "Invalid commit review id.",
        }

    if status not in VALID_COMMIT_STATUSES:
        return {
            "success": False,
            "message": "Invalid status. Allowed statuses are: Pending Review, Approved, Changes Requested.",
        }

    commit = commit_reviews_collection.find_one({"_id": object_id})

    if not commit:
        return {
            "success": False,
            "message": "Commit review not found.",
        }

    old_status = commit.get("status", "Pending Review")

    commit_reviews_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": status,
                "admin_updated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_commit = commit_reviews_collection.find_one({"_id": object_id})

    commit_message = (
        updated_commit.get("message")
        or updated_commit.get("commit_id")
        or str(commit_id)
    )

    create_admin_log(
        action_type="COMMIT_STATUS_UPDATED",
        target_type="commit_review",
        target_id=commit_id,
        description=f"Admin changed commit status from {old_status} to {status}: {commit_message}",
        extra_data={
            "commit_id": commit_id,
            "github_commit_id": updated_commit.get("commit_id"),
            "repo_name": updated_commit.get("repo_name"),
            "developer_name": updated_commit.get("developer_name"),
            "old_status": old_status,
            "new_status": status,
        },
    )

    return {
        "success": True,
        "message": f"Commit status updated to {status} successfully.",
        "commit": safe_serialize(updated_commit),
    }