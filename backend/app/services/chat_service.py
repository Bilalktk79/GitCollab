from datetime import datetime
from bson import ObjectId
from app.database.db import db
from app.services.notification_service import create_notification


chat_collection = db["chat_messages"]


def normalize_text(value):
    if value is None:
        return ""
    return str(value).strip()


def serialize_chat_message(message):
    return {
        "id": str(message["_id"]),
        "sender_id": normalize_text(message.get("sender_id")),
        "sender_name": message.get("sender_name") or "User",
        "sender_role": message.get("sender_role") or "developer",
        "receiver_id": normalize_text(message.get("receiver_id")),
        "receiver_name": message.get("receiver_name") or "User",
        "repo_id": normalize_text(message.get("repo_id")),
        "repo_name": message.get("repo_name") or "Repository",
        "commit_id": normalize_text(message.get("commit_id")),
        "message": message.get("message") or "",
        "is_read": message.get("is_read", False),
        "created_at": message.get("created_at"),
    }


def serialize_conversation(item):
    return {
        "id": item.get("id"),
        "participant_id": item.get("participant_id"),
        "participant_name": item.get("participant_name"),
        "participant_role": item.get("participant_role"),
        "repo_id": item.get("repo_id"),
        "repo_name": item.get("repo_name"),
        "commit_id": item.get("commit_id"),
        "title": item.get("title"),
        "last_message": item.get("last_message"),
        "unread_count": item.get("unread_count", 0),
        "updated_at": item.get("updated_at"),
        "type": item.get("type", "repo-support"),
        "status": item.get("status", "online"),
        "priority": item.get("priority", "medium"),
        "review_status": item.get("review_status", "Pending Review"),
    }


def send_chat_message(data):
    sender_id = normalize_text(data.sender_id)
    receiver_id = normalize_text(data.receiver_id)
    repo_id = normalize_text(data.repo_id)
    commit_id = normalize_text(data.commit_id)

    chat_message = {
        "sender_id": sender_id,
        "sender_name": data.sender_name,
        "sender_role": data.sender_role,
        "receiver_id": receiver_id,
        "receiver_name": data.receiver_name,
        "repo_id": repo_id,
        "repo_name": data.repo_name,
        "commit_id": commit_id,
        "message": data.message,
        "is_read": False,
        "created_at": datetime.utcnow(),
    }

    result = chat_collection.insert_one(chat_message)
    chat_message["_id"] = result.inserted_id

    create_notification({
        "user_id": receiver_id,
        "title": "New Chat Message",
        "message": f"{data.sender_name} sent you a message.",
        "type": "chat",
        "related_id": str(result.inserted_id),
    })

    return serialize_chat_message(chat_message)


def get_conversation(
    user1_id: str,
    user2_id: str,
    repo_id: str = None,
    commit_id: str = None
):
    user1_id = normalize_text(user1_id)
    user2_id = normalize_text(user2_id)
    repo_id = normalize_text(repo_id)
    commit_id = normalize_text(commit_id)

    query = {
        "$or": [
            {"sender_id": user1_id, "receiver_id": user2_id},
            {"sender_id": user2_id, "receiver_id": user1_id},
        ]
    }

    if repo_id:
        query["repo_id"] = repo_id

    if commit_id:
        query["commit_id"] = commit_id
    else:
        query["$and"] = [
            {
                "$or": [
                    {"commit_id": ""},
                    {"commit_id": None},
                    {"commit_id": {"$exists": False}},
                ]
            }
        ]

    messages = chat_collection.find(query).sort("created_at", 1)

    return [serialize_chat_message(item) for item in messages]


def get_commit_messages(commit_id: str):
    commit_id = normalize_text(commit_id)

    messages = chat_collection.find(
        {"commit_id": commit_id}
    ).sort("created_at", 1)

    return [serialize_chat_message(item) for item in messages]


def get_user_conversations(user_id: str):
    user_id = normalize_text(user_id)

    query = {
        "$or": [
            {"sender_id": user_id},
            {"receiver_id": user_id},
        ]
    }

    messages = list(chat_collection.find(query).sort("created_at", -1))

    conversations = {}

    for message in messages:
        sender_id = normalize_text(message.get("sender_id"))
        receiver_id = normalize_text(message.get("receiver_id"))

        if sender_id == user_id:
            participant_id = receiver_id
            participant_name = message.get("receiver_name") or "User"

            sender_role = message.get("sender_role") or "developer"
            participant_role = "client" if sender_role == "developer" else "developer"
        else:
            participant_id = sender_id
            participant_name = message.get("sender_name") or "User"
            participant_role = message.get("sender_role") or "developer"

        repo_id = normalize_text(message.get("repo_id"))
        repo_name = message.get("repo_name") or "Repository"
        commit_id = normalize_text(message.get("commit_id"))

        conversation_key = f"{participant_id}__{repo_id}__{commit_id or 'repo'}"

        if conversation_key in conversations:
            continue

        if commit_id:
            unread_query = {
                "sender_id": participant_id,
                "receiver_id": user_id,
                "repo_id": repo_id,
                "commit_id": commit_id,
                "is_read": False,
            }

            title = "Commit Review Discussion"
            conversation_type = "commit-review"
        else:
            unread_query = {
                "sender_id": participant_id,
                "receiver_id": user_id,
                "repo_id": repo_id,
                "is_read": False,
                "$or": [
                    {"commit_id": ""},
                    {"commit_id": None},
                    {"commit_id": {"$exists": False}},
                ],
            }

            title = "Repository Discussion"
            conversation_type = "repo-support"

        unread_count = chat_collection.count_documents(unread_query)

        conversations[conversation_key] = {
            "id": conversation_key,
            "participant_id": participant_id,
            "participant_name": participant_name,
            "participant_role": participant_role,
            "repo_id": repo_id,
            "repo_name": repo_name,
            "commit_id": commit_id,
            "title": title,
            "last_message": message.get("message") or "",
            "unread_count": unread_count,
            "updated_at": message.get("created_at"),
            "type": conversation_type,
            "status": "online",
            "priority": "medium",
            "review_status": "Pending Review",
        }

    return [serialize_conversation(item) for item in conversations.values()]


def mark_message_read(message_id: str):
    if not ObjectId.is_valid(message_id):
        return None

    chat_collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"is_read": True}}
    )

    message = chat_collection.find_one(
        {"_id": ObjectId(message_id)}
    )

    if not message:
        return None

    return serialize_chat_message(message)