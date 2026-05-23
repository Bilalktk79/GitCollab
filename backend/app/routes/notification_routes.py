from fastapi import APIRouter
from app.models.notification_model import NotificationCreate
from app.controllers.notification_controller import (
    create_notification_controller,
    get_notifications_controller,
    mark_notification_read_controller,
)


router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("/create")
def create_notification(data: NotificationCreate):
    return create_notification_controller(data)


@router.get("/{user_id}")
def get_notifications(user_id: str):
    return get_notifications_controller(user_id)


@router.put("/{notification_id}/read")
def read_notification(notification_id: str):
    return mark_notification_read_controller(notification_id)