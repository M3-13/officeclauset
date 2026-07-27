from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/health")
def health() -> dict:
    return {"status": "ok"}
