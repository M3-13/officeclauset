from fastapi import APIRouter

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
