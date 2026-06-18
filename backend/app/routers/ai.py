import httpx
from fastapi import APIRouter, Depends

from app.config import settings
from app.core.deps import get_current_user
from app.database import get_db
from app.schemas import AIReportRequest, AIReportResponse, utcnow

router = APIRouter(prefix="/ai", tags=["AI Engine"])


async def gather_context(context_type: str) -> str:
    db = get_db()
    if context_type == "assets":
        assets = await db.assets.find().limit(20).to_list(20)
        return "\n".join(
            f"- {a['name']} ({a['category']}): {a['status']}, assigned to {a.get('assigned_to', 'N/A')}"
            for a in assets
        )
    if context_type == "licenses":
        licenses = await db.licenses.find().limit(20).to_list(20)
        return "\n".join(
            f"- {l['name']} by {l['vendor']}: {l['used_seats']}/{l['seats']} seats, status={l['status']}"
            for l in licenses
        )
    if context_type == "tickets":
        tickets = await db.tickets.find().sort("created_at", -1).limit(15).to_list(15)
        return "\n".join(
            f"- [{t['priority']}] {t['title']}: {t['status']} (by {t['created_by']})" for t in tickets
        )
    return "General IT asset and license management overview."


@router.post("/report", response_model=AIReportResponse)
async def generate_report(payload: AIReportRequest, _: dict = Depends(get_current_user)):
    context = await gather_context(payload.context_type)
    system_prompt = (
        "You are an IT asset management analyst. Provide concise, actionable insights "
        "based on the data provided. Use bullet points and highlight risks."
    )
    user_message = f"Context ({payload.context_type}):\n{context}\n\nUser request: {payload.prompt}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "stream": False,
                },
            )
            response.raise_for_status()
            report = response.json()["message"]["content"]
    except Exception:
        report = (
            f"**AI Report — {payload.context_type.title()}**\n\n"
            f"Based on current data:\n{context}\n\n"
            f"**Analysis for:** {payload.prompt}\n\n"
            "- Ollama is not running locally. Start it with `ollama serve` to enable live AI reports.\n"
            "- Review expiring licenses and open maintenance items as priority actions.\n"
            "- Consider reallocating available assets before new purchases."
        )

    return AIReportResponse(report=report, generated_at=utcnow())
