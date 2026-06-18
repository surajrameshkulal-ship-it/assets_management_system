from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.schemas import AssetCreate, AssetResponse, utcnow

router = APIRouter(prefix="/assets", tags=["Assets"])


def serialize(doc: dict) -> AssetResponse:
    return AssetResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        category=doc["category"],
        serial_number=doc["serial_number"],
        status=doc["status"],
        assigned_to=doc.get("assigned_to"),
        location=doc.get("location"),
        purchase_date=doc.get("purchase_date"),
        warranty_expiry=doc.get("warranty_expiry"),
        notes=doc.get("notes"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[AssetResponse])
async def list_assets(_: dict = Depends(get_current_user)):
    db = get_db()
    assets = await db.assets.find().sort("created_at", -1).to_list(500)
    return [serialize(a) for a in assets]


@router.post("", response_model=AssetResponse)
async def create_asset(payload: AssetCreate, user: dict = Depends(require_admin)):
    db = get_db()
    now = utcnow()
    doc = {**payload.model_dump(), "created_at": now, "updated_at": now}
    result = await db.assets.insert_one(doc)
    doc["_id"] = result.inserted_id

    await db.asset_history.insert_one(
        {
            "asset_id": str(result.inserted_id),
            "action": "created",
            "user": user["email"],
            "details": f"Asset {payload.name} created",
            "timestamp": now,
        }
    )
    return serialize(doc)


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(asset_id: str, payload: AssetCreate, user: dict = Depends(require_admin)):
    db = get_db()
    now = utcnow()
    result = await db.assets.find_one_and_update(
        {"_id": ObjectId(asset_id)},
        {"$set": {**payload.model_dump(), "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    await db.asset_history.insert_one(
        {
            "asset_id": asset_id,
            "action": "updated",
            "user": user["email"],
            "details": f"Asset {payload.name} updated",
            "timestamp": now,
        }
    )
    return serialize(result)


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, user: dict = Depends(require_admin)):
    db = get_db()
    result = await db.assets.delete_one({"_id": ObjectId(asset_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    await db.asset_history.insert_one(
        {
            "asset_id": asset_id,
            "action": "deleted",
            "user": user["email"],
            "details": "Asset removed from inventory",
            "timestamp": utcnow(),
        }
    )
    return {"message": "Asset deleted"}


@router.get("/{asset_id}/history")
async def asset_history(asset_id: str, _: dict = Depends(get_current_user)):
    db = get_db()
    history = await db.asset_history.find({"asset_id": asset_id}).sort("timestamp", -1).to_list(100)
    for h in history:
        h["id"] = str(h.pop("_id"))
    return history
