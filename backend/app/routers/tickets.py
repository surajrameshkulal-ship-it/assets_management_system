from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.schemas import TicketCreate, TicketResponse, utcnow

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def serialize(doc: dict) -> TicketResponse:
    return TicketResponse(
        id=str(doc["_id"]),
        title=doc["title"],
        description=doc["description"],
        priority=doc["priority"],
        status=doc["status"],
        asset_id=doc.get("asset_id"),
        assigned_to=doc.get("assigned_to"),
        created_by=doc["created_by"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[TicketResponse])
async def list_tickets(user: dict = Depends(get_current_user)):
    db = get_db()
    query = {} if user["role"] == "admin" else {"created_by": user["full_name"]}
    tickets = await db.tickets.find(query).sort("created_at", -1).to_list(500)
    return [serialize(t) for t in tickets]


@router.post("", response_model=TicketResponse)
async def create_ticket(payload: TicketCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    now = utcnow()
    doc = {
        **payload.model_dump(),
        "status": "open",
        "created_by": user["full_name"],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.tickets.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.patch("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status_value: str,
    _: dict = Depends(require_admin),
):
    db = get_db()
    now = utcnow()
    result = await db.tickets.find_one_and_update(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": status_value, "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return serialize(result)
