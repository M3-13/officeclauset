from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
