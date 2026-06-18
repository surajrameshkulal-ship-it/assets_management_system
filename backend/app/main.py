from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_db, connect_db
from app.routers import ai, assets, auth, dashboard, employees, licenses, notifications, tickets
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    await seed_database()
    yield
    await close_db()


app = FastAPI(
    title="AssetFlow API",
    description="IT Asset & License Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(licenses.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "assetflow-api"}
