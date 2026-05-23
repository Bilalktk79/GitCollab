from fastapi import HTTPException
from app.models.notification_model import NotificationCreate
from app.services.notification_service import (
    create_notification,
    get_user_notifications,
    mark_notification_read,
)


def create_notification_controller(data: NotificationCreate):
    return create_notification(data.dict())


def get_notifications_controller(user_id: str):
    return get_user_notifications(user_id)


def mark_notification_read_controller(notification_id: str):
    notification = mark_notification_read(notification_id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return notification