from fastapi import APIRouter

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
