from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.database import get_db
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(_: dict = Depends(get_current_user)):
    db = get_db()
    total_assets = await db.assets.count_documents({})
    assigned_assets = await db.assets.count_documents({"status": "assigned"})
    available_assets = await db.assets.count_documents({"status": "available"})
    maintenance_assets = await db.assets.count_documents({"status": "maintenance"})
    total_licenses = await db.licenses.count_documents({})
    expiring_licenses = await db.licenses.count_documents({"status": {"$in": ["expiring", "compliance_risk"]}})
    open_tickets = await db.tickets.count_documents({"status": {"$in": ["open", "in_progress"]}})
    total_employees = await db.employees.count_documents({})

    return DashboardStats(
        total_assets=total_assets,
        assigned_assets=assigned_assets,
        available_assets=available_assets,
        maintenance_assets=maintenance_assets,
        total_licenses=total_licenses,
        expiring_licenses=expiring_licenses,
        open_tickets=open_tickets,
        total_employees=total_employees,
    )


@router.get("/activity")
async def recent_activity(_: dict = Depends(get_current_user)):
    db = get_db()
    logs = await db.audit_logs.find().sort("timestamp", -1).limit(10).to_list(10)
    for log in logs:
        log["id"] = str(log.pop("_id"))
    return logs


@router.get("/asset-distribution")
async def asset_distribution(_: dict = Depends(get_current_user)):
    db = get_db()
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    results = await db.assets.aggregate(pipeline).to_list(50)
    return [{"category": r["_id"], "count": r["count"]} for r in results]
