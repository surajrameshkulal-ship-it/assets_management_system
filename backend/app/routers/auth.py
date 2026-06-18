from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user, require_admin
from app.core.security import create_access_token, verify_password
from app.database import get_db
from app.schemas import LoginRequest, TokenResponse, UserCreate, UserResponse, utcnow

router = APIRouter(prefix="/auth", tags=["Authentication"])


def serialize_user(doc: dict) -> UserResponse:
    return UserResponse(
        id=str(doc["_id"]),
        email=doc["email"],
        full_name=doc["full_name"],
        role=doc["role"],
        department=doc.get("department"),
        created_at=doc["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"], "role": user["role"]})
    return TokenResponse(access_token=token, user=serialize_user(user))


@router.get("/me", response_model=UserResponse)
async def me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        department=user.get("department"),
        created_at=user["created_at"],
    )


@router.post("/register", response_model=UserResponse)
async def register(payload: UserCreate, _: dict = Depends(require_admin)):
    from app.core.security import hash_password

    db = get_db()
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    doc = {
        "email": payload.email,
        "password": hash_password(payload.password),
        "full_name": payload.full_name,
        "role": payload.role,
        "department": payload.department,
        "created_at": utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_user(doc)
