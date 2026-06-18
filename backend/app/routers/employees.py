from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeResponse, utcnow

router = APIRouter(prefix="/employees", tags=["Employees"])


def serialize(doc: dict) -> EmployeeResponse:
    return EmployeeResponse(
        id=str(doc["_id"]),
        full_name=doc["full_name"],
        email=doc["email"],
        department=doc["department"],
        job_title=doc.get("job_title"),
        phone=doc.get("phone"),
        status=doc.get("status", "active"),
        created_at=doc["created_at"],
    )


@router.get("", response_model=list[EmployeeResponse])
async def list_employees(_: dict = Depends(get_current_user)):
    db = get_db()
    employees = await db.employees.find().sort("full_name", 1).to_list(500)
    return [serialize(e) for e in employees]


@router.post("", response_model=EmployeeResponse)
async def create_employee(payload: EmployeeCreate, _: dict = Depends(require_admin)):
    db = get_db()
    doc = {**payload.model_dump(), "status": "active", "created_at": utcnow()}
    result = await db.employees.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(employee_id: str, payload: EmployeeCreate, _: dict = Depends(require_admin)):
    db = get_db()
    result = await db.employees.find_one_and_update(
        {"_id": ObjectId(employee_id)},
        {"$set": payload.model_dump()},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return serialize(result)
