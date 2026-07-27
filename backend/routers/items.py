import os
import uuid
from io import BytesIO

from auth import get_current_user
from config import UPLOAD_DIR
from database import get_db
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from models import ClothingItem, User
from PIL import Image
from schemas import ClothingItemResponse
from sqlalchemy import String, cast
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/items", tags=["items"])

ALLOWED_CATEGORIES = {"Oberteile", "Hosen", "Schuhe", "Accessoires", "Jacken", "Kleider"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_NAME_LENGTH = 100
MAX_COLOR_BRAND_LENGTH = 50


def _validate_category(category: str) -> None:
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid category. Must be one of: {', '.join(sorted(ALLOWED_CATEGORIES))}",
        )


def _validate_name(name: str) -> None:
    name = name.strip()
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


def _validate_optional_field(value: str | None, field_name: str) -> None:
    if value is not None and len(value) > MAX_COLOR_BRAND_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"{field_name} must not exceed {MAX_COLOR_BRAND_LENGTH} characters",
        )


def _process_image(upload: UploadFile) -> str:
    content_type = upload.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Only JPEG and PNG images are allowed",
        )

    contents = upload.file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Image must not exceed 5 MB",
        )

    ext = ".jpg" if "jpeg" in content_type else ".png"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    img = Image.open(BytesIO(contents))
    img.load()
    data = list(img.get_flattened_data())
    mode = img.mode
    new_img = Image.new(mode, img.size)
    new_img.putdata(data)
    new_img.save(filepath)

    return filename


def _get_own_item(item_id: int, user: User, db: Session) -> ClothingItem:
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    if item.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return item


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("", response_model=list[ClothingItemResponse])
def list_items(
    category: str | None = Query(None),
    search: str | None = Query(None),
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> list[ClothingItem]:
    query = db.query(ClothingItem).filter(ClothingItem.user_id == user.id)

    if category:
        _validate_category(category)
        query = query.filter(ClothingItem.category == category)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            cast(ClothingItem.name, String).ilike(search_term)
            | cast(ClothingItem.brand, String).ilike(search_term)
            | cast(ClothingItem.color, String).ilike(search_term)
        )

    return query.order_by(ClothingItem.created_at.desc()).all()


@router.post("", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    name: str = Form(...),
    category: str = Form(...),
    color: str | None = Form(None),
    brand: str | None = Form(None),
    image: UploadFile = File(...),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> ClothingItem:
    _validate_name(name)
    _validate_category(category)
    _validate_optional_field(color, "Color")
    _validate_optional_field(brand, "Brand")

    filename = _process_image(image)

    item = ClothingItem(
        user_id=user.id,
        name=name.strip(),
        category=category,
        color=color.strip() if color else None,
        brand=brand.strip() if brand else None,
        image_path=filename,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ClothingItemResponse)
def get_item(
    item_id: int,
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> ClothingItem:
    return _get_own_item(item_id, user, db)


@router.put("/{item_id}", response_model=ClothingItemResponse)
def update_item(
    item_id: int,
    name: str | None = Form(None),
    category: str | None = Form(None),
    color: str | None = Form(None),
    brand: str | None = Form(None),
    image: UploadFile | None = File(None),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> ClothingItem:
    item = _get_own_item(item_id, user, db)

    if name is not None:
        _validate_name(name)
        item.name = name.strip()

    if category is not None:
        _validate_category(category)
        item.category = category

    if color is not None:
        _validate_optional_field(color, "Color")
        item.color = color.strip()

    if brand is not None:
        _validate_optional_field(brand, "Brand")
        item.brand = brand.strip()

    if image is not None:
        if item.image_path:
            old_path = os.path.join(UPLOAD_DIR, item.image_path)
            if os.path.isfile(old_path):
                os.remove(old_path)
        item.image_path = _process_image(image)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    user: User = Depends(get_current_user),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> dict:
    item = _get_own_item(item_id, user, db)

    if item.image_path:
        old_path = os.path.join(UPLOAD_DIR, item.image_path)
        if os.path.isfile(old_path):
            os.remove(old_path)

    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}
