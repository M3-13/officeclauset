import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from config import UPLOAD_DIR
from database import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models import Base
from routers import auth, items, outfits, users
from routers import router as root_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(title="OfficeClauset", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(root_router)
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(outfits.router)
app.include_router(users.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
