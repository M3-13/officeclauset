from fastapi import APIRouter

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
