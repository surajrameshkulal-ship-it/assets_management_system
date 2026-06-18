from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.schemas import LicenseCreate, LicenseResponse, utcnow

router = APIRouter(prefix="/licenses", tags=["Licenses"])


def serialize(doc: dict) -> LicenseResponse:
    return LicenseResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        vendor=doc["vendor"],
        license_key=doc.get("license_key"),
        seats=doc["seats"],
        used_seats=doc["used_seats"],
        status=doc["status"],
        expiry_date=doc.get("expiry_date"),
        cost=doc.get("cost"),
        assigned_assets=doc.get("assigned_assets", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[LicenseResponse])
async def list_licenses(_: dict = Depends(get_current_user)):
    db = get_db()
    licenses = await db.licenses.find().sort("expiry_date", 1).to_list(500)
    return [serialize(l) for l in licenses]


@router.post("", response_model=LicenseResponse)
async def create_license(payload: LicenseCreate, user: dict = Depends(require_admin)):
    db = get_db()
    now = utcnow()
    doc = {**payload.model_dump(), "created_at": now, "updated_at": now}
    result = await db.licenses.insert_one(doc)
    doc["_id"] = result.inserted_id

    await db.license_history.insert_one(
        {
            "license_id": str(result.inserted_id),
            "action": "created",
            "user": user["email"],
            "details": f"License {payload.name} added",
            "timestamp": now,
        }
    )
    return serialize(doc)


@router.put("/{license_id}", response_model=LicenseResponse)
async def update_license(license_id: str, payload: LicenseCreate, user: dict = Depends(require_admin)):
    db = get_db()
    now = utcnow()
    result = await db.licenses.find_one_and_update(
        {"_id": ObjectId(license_id)},
        {"$set": {**payload.model_dump(), "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")

    await db.license_history.insert_one(
        {
            "license_id": license_id,
            "action": "updated",
            "user": user["email"],
            "details": f"License {payload.name} updated",
            "timestamp": now,
        }
    )
    return serialize(result)
