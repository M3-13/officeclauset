import os
from contextlib import suppress

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, status
from models import User
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    current_user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> None:
    clothing_items = current_user.clothing_items or []
    image_paths = [ci.image_path for ci in clothing_items if ci.image_path]

    db.delete(current_user)
    db.commit()

    for path in image_paths:
        with suppress(OSError):
            os.remove(path)
