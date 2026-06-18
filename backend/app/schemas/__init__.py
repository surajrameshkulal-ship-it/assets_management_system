from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


Role = Literal["admin", "employee"]
AssetStatus = Literal["available", "assigned", "maintenance", "retired"]
LicenseStatus = Literal["active", "expiring", "expired", "compliance_risk"]
TicketStatus = Literal["open", "in_progress", "resolved", "closed"]
TicketPriority = Literal["low", "medium", "high", "critical"]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: Role = "employee"
    department: str | None = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: Role
    department: str | None = None
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AssetCreate(BaseModel):
    name: str
    category: str
    serial_number: str
    status: AssetStatus = "available"
    assigned_to: str | None = None
    location: str | None = None
    purchase_date: datetime | None = None
    warranty_expiry: datetime | None = None
    notes: str | None = None


class AssetResponse(AssetCreate):
    id: str
    created_at: datetime
    updated_at: datetime


class LicenseCreate(BaseModel):
    name: str
    vendor: str
    license_key: str | None = None
    seats: int = 1
    used_seats: int = 0
    status: LicenseStatus = "active"
    expiry_date: datetime | None = None
    cost: float | None = None
    assigned_assets: list[str] = Field(default_factory=list)


class LicenseResponse(LicenseCreate):
    id: str
    created_at: datetime
    updated_at: datetime


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    department: str
    job_title: str | None = None
    phone: str | None = None


class EmployeeResponse(EmployeeCreate):
    id: str
    status: Literal["active", "inactive"] = "active"
    created_at: datetime


class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = "medium"
    asset_id: str | None = None
    assigned_to: str | None = None


class TicketResponse(TicketCreate):
    id: str
    status: TicketStatus = "open"
    created_by: str
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    total_assets: int
    assigned_assets: int
    available_assets: int
    maintenance_assets: int
    total_licenses: int
    expiring_licenses: int
    open_tickets: int
    total_employees: int


class AIReportRequest(BaseModel):
    prompt: str
    context_type: Literal["assets", "licenses", "tickets", "general"] = "general"


class AIReportResponse(BaseModel):
    report: str
    generated_at: datetime


class NotificationCreate(BaseModel):
    title: str
    message: str
    recipient_email: EmailStr
    type: Literal["alert", "reminder", "info"] = "info"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
