from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    privacy_accepted: bool


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ClothingItemCreate(BaseModel):
    name: str
    category: str
    color: str | None = None
    brand: str | None = None


class ClothingItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    color: str | None = None
    brand: str | None = None


class ClothingItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    color: str | None = None
    brand: str | None = None
    image_path: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitCreate(BaseModel):
    name: str
    item_ids: list[int]


class OutfitItemResponse(BaseModel):
    id: int
    clothing_item_id: int
    category: str
    clothing_item: ClothingItemResponse | None = None

    model_config = {"from_attributes": True}


class OutfitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitDetailResponse(BaseModel):
    id: int
    user_id: int
    name: str
    created_at: datetime
    items: list[OutfitItemResponse] = []

    model_config = {"from_attributes": True}
