from datetime import datetime, timedelta

from app.core.security import hash_password
from app.database import get_db
from app.schemas import utcnow


async def seed_database() -> None:
    db = get_db()

    if await db.users.count_documents({}) == 0:
        now = utcnow()
        await db.users.insert_many(
            [
                {
                    "email": "admin@assetflow.io",
                    "password": hash_password("admin123"),
                    "full_name": "System Administrator",
                    "role": "admin",
                    "department": "IT",
                    "created_at": now,
                },
                {
                    "email": "employee@assetflow.io",
                    "password": hash_password("employee123"),
                    "full_name": "Jane Employee",
                    "role": "employee",
                    "department": "Engineering",
                    "created_at": now,
                },
            ]
        )

    if await db.employees.count_documents({}) == 0:
        now = utcnow()
        employees = [
            {
                "full_name": "Jane Employee",
                "email": "employee@assetflow.io",
                "department": "Engineering",
                "job_title": "Software Engineer",
                "phone": "+1-555-0101",
                "status": "active",
                "created_at": now,
            },
            {
                "full_name": "John Smith",
                "email": "john.smith@assetflow.io",
                "department": "Design",
                "job_title": "Product Designer",
                "phone": "+1-555-0102",
                "status": "active",
                "created_at": now,
            },
            {
                "full_name": "Sarah Chen",
                "email": "sarah.chen@assetflow.io",
                "department": "Operations",
                "job_title": "Ops Manager",
                "phone": "+1-555-0103",
                "status": "active",
                "created_at": now,
            },
        ]
        await db.employees.insert_many(employees)

    if await db.assets.count_documents({}) == 0:
        now = utcnow()
        assets = [
            {
                "name": "MacBook Pro 16\"",
                "category": "Laptop",
                "serial_number": "MBP-2024-001",
                "status": "assigned",
                "assigned_to": "Jane Employee",
                "location": "HQ - Floor 3",
                "purchase_date": now - timedelta(days=180),
                "warranty_expiry": now + timedelta(days=545),
                "notes": "M3 Max, 36GB RAM",
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "Dell UltraSharp 27\"",
                "category": "Monitor",
                "serial_number": "MON-2024-042",
                "status": "assigned",
                "assigned_to": "John Smith",
                "location": "HQ - Floor 2",
                "purchase_date": now - timedelta(days=90),
                "warranty_expiry": now + timedelta(days=635),
                "notes": None,
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "iPhone 15 Pro",
                "category": "Mobile",
                "serial_number": "IPH-2024-118",
                "status": "available",
                "assigned_to": None,
                "location": "IT Storage",
                "purchase_date": now - timedelta(days=30),
                "warranty_expiry": now + timedelta(days=335),
                "notes": "Spare device pool",
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "HP LaserJet Pro",
                "category": "Printer",
                "serial_number": "PRT-2023-009",
                "status": "maintenance",
                "assigned_to": None,
                "location": "HQ - Floor 1",
                "purchase_date": now - timedelta(days=400),
                "warranty_expiry": now - timedelta(days=35),
                "notes": "Paper jam issue",
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "ThinkPad X1 Carbon",
                "category": "Laptop",
                "serial_number": "TPX-2024-055",
                "status": "assigned",
                "assigned_to": "Sarah Chen",
                "location": "Remote",
                "purchase_date": now - timedelta(days=60),
                "warranty_expiry": now + timedelta(days=665),
                "notes": None,
                "created_at": now,
                "updated_at": now,
            },
        ]
        await db.assets.insert_many(assets)

    if await db.licenses.count_documents({}) == 0:
        now = utcnow()
        licenses = [
            {
                "name": "Microsoft 365 Business",
                "vendor": "Microsoft",
                "license_key": "MS365-****-****",
                "seats": 50,
                "used_seats": 42,
                "status": "active",
                "expiry_date": now + timedelta(days=120),
                "cost": 7500.0,
                "assigned_assets": [],
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "Adobe Creative Cloud",
                "vendor": "Adobe",
                "license_key": "ADOBE-****-****",
                "seats": 10,
                "used_seats": 10,
                "status": "compliance_risk",
                "expiry_date": now + timedelta(days=45),
                "cost": 6000.0,
                "assigned_assets": [],
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "JetBrains All Products",
                "vendor": "JetBrains",
                "license_key": "JB-****-****",
                "seats": 25,
                "used_seats": 18,
                "status": "active",
                "expiry_date": now + timedelta(days=200),
                "cost": 3750.0,
                "assigned_assets": [],
                "created_at": now,
                "updated_at": now,
            },
            {
                "name": "Slack Enterprise",
                "vendor": "Salesforce",
                "license_key": None,
                "seats": 100,
                "used_seats": 87,
                "status": "expiring",
                "expiry_date": now + timedelta(days=14),
                "cost": 12000.0,
                "assigned_assets": [],
                "created_at": now,
                "updated_at": now,
            },
        ]
        await db.licenses.insert_many(licenses)

    if await db.tickets.count_documents({}) == 0:
        now = utcnow()
        tickets = [
            {
                "title": "Laptop keyboard not responding",
                "description": "Keys on the left side intermittently stop working.",
                "priority": "high",
                "status": "open",
                "asset_id": None,
                "assigned_to": "IT Support",
                "created_by": "Jane Employee",
                "created_at": now - timedelta(hours=5),
                "updated_at": now - timedelta(hours=5),
            },
            {
                "title": "Request new monitor",
                "description": "Need a second monitor for dual-screen setup.",
                "priority": "medium",
                "status": "in_progress",
                "asset_id": None,
                "assigned_to": "IT Support",
                "created_by": "John Smith",
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(hours=12),
            },
            {
                "title": "Software license renewal",
                "description": "Adobe CC seats exceeded — need approval for 5 more.",
                "priority": "critical",
                "status": "open",
                "asset_id": None,
                "assigned_to": "Admin",
                "created_by": "Sarah Chen",
                "created_at": now - timedelta(days=1),
                "updated_at": now - timedelta(days=1),
            },
        ]
        await db.tickets.insert_many(tickets)

    if await db.audit_logs.count_documents({}) == 0:
        now = utcnow()
        logs = [
            {
                "action": "asset_assigned",
                "entity": "asset",
                "entity_id": "MBP-2024-001",
                "user": "admin@assetflow.io",
                "details": "Assigned MacBook Pro to Jane Employee",
                "timestamp": now - timedelta(hours=3),
            },
            {
                "action": "license_renewed",
                "entity": "license",
                "entity_id": "MS365",
                "user": "admin@assetflow.io",
                "details": "Renewed Microsoft 365 for 12 months",
                "timestamp": now - timedelta(days=1),
            },
            {
                "action": "ticket_created",
                "entity": "ticket",
                "entity_id": "TKT-001",
                "user": "employee@assetflow.io",
                "details": "Created support ticket for keyboard issue",
                "timestamp": now - timedelta(hours=5),
            },
        ]
        await db.audit_logs.insert_many(logs)
