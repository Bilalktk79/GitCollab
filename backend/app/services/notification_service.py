from datetime import datetime
from bson import ObjectId
from app.database.db import db


notifications_collection = db["notifications"]


def serialize_notification(notification):
    return {
        "id": str(notification["_id"]),
        "user_id": notification.get("user_id"),
        "title": notification.get("title"),
        "message": notification.get("message"),
        "type": notification.get("type"),
        "related_id": notification.get("related_id"),
        "is_read": notification.get("is_read", False),
        "created_at": notification.get("created_at"),
    }


def create_notification(data):
    notification = {
        "user_id": data.get("user_id"),
        "title": data.get("title"),
        "message": data.get("message"),
        "type": data.get("type"),
        "related_id": data.get("related_id"),
        "is_read": False,
        "created_at": datetime.utcnow(),
    }

    result = notifications_collection.insert_one(notification)
    notification["_id"] = result.inserted_id

    return serialize_notification(notification)


def get_user_notifications(user_id: str):
    notifications = notifications_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1)

    return [serialize_notification(item) for item in notifications]


def mark_notification_read(notification_id: str):
    if not ObjectId.is_valid(notification_id):
        return None

    notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )

    notification = notifications_collection.find_one(
        {"_id": ObjectId(notification_id)}
    )

    if not notification:
        return None

    return serialize_notification(notification)