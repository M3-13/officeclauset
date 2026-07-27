from auth import get_current_user
from constants import ALLOWED_CATEGORIES, MAX_NAME_LENGTH
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import ClothingItem, Outfit, OutfitItem, User
from schemas import OutfitCreate, OutfitDetailResponse
from sqlalchemy.orm import Session, joinedload

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


def _get_own_outfit(outfit_id: int, user: User, db: Session) -> Outfit:
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None or outfit.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("", response_model=list[OutfitDetailResponse])
def list_outfits(
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> list[Outfit]:
    return (
        db.query(Outfit)
        .filter(Outfit.user_id == user.id)
        .options(joinedload(Outfit.items).joinedload(OutfitItem.clothing_item))
        .order_by(Outfit.created_at.desc())
        .all()
    )


@router.post("", response_model=OutfitDetailResponse, status_code=status.HTTP_201_CREATED)
def create_outfit(
    data: OutfitCreate,
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> Outfit:
    name = data.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Name is required",
        )
    if len(name) > MAX_NAME_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Name must not exceed {MAX_NAME_LENGTH} characters",
        )

    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="At least one item is required",
        )

    seen_categories: set[str] = set()
    for item_entry in data.items:
        if item_entry.category not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Invalid category: {item_entry.category}",
            )
        if item_entry.category in seen_categories:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Only one item per category allowed: {item_entry.category}",
            )
        seen_categories.add(item_entry.category)

    for item_entry in data.items:
        item = (
            db.query(ClothingItem)
            .filter(
                ClothingItem.id == item_entry.clothing_item_id,
                ClothingItem.user_id == user.id,
            )
            .first()
        )
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Clothing item {item_entry.clothing_item_id} not found",
            )
        if item.category != item_entry.category:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Item {item_entry.clothing_item_id} does not belong to category {item_entry.category}",
            )

    outfit = Outfit(user_id=user.id, name=name)
    db.add(outfit)
    db.flush()

    for item_entry in data.items:
        outfit_item = OutfitItem(
            outfit_id=outfit.id,
            clothing_item_id=item_entry.clothing_item_id,
            category=item_entry.category,
        )
        db.add(outfit_item)

    db.commit()

    return (
        db.query(Outfit)
        .filter(Outfit.id == outfit.id)
        .options(joinedload(Outfit.items).joinedload(OutfitItem.clothing_item))
        .first()
    )


@router.get("/{outfit_id}", response_model=OutfitDetailResponse)
def get_outfit(
    outfit_id: int,
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> Outfit:
    outfit = (
        db.query(Outfit)
        .filter(Outfit.id == outfit_id)
        .options(joinedload(Outfit.items).joinedload(OutfitItem.clothing_item))
        .first()
    )
    if outfit is None or outfit.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )
    return outfit


@router.delete("/{outfit_id}")
def delete_outfit(
    outfit_id: int,
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> dict:
    outfit = _get_own_outfit(outfit_id, user, db)
    db.delete(outfit)
    db.commit()
    return {"message": "Outfit deleted"}
