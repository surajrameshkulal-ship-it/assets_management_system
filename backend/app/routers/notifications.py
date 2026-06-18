from fastapi import APIRouter, Depends

from app.core.deps import require_admin
from app.database import get_db
from app.schemas import NotificationCreate, utcnow

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(_: dict = Depends(require_admin)):
    db = get_db()
    notifications = await db.notifications.find().sort("created_at", -1).limit(50).to_list(50)
    for n in notifications:
        n["id"] = str(n.pop("_id"))
    return notifications


@router.post("")
async def send_notification(payload: NotificationCreate, _: dict = Depends(require_admin)):
    db = get_db()
    doc = {
        **payload.model_dump(),
        "sent": True,
        "created_at": utcnow(),
    }
    result = await db.notifications.insert_one(doc)
    return {
        "id": str(result.inserted_id),
        "message": f"Notification queued for {payload.recipient_email}",
    }
