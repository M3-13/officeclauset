import io
import os

from fastapi.testclient import TestClient
from main import app
from PIL import Image


def _make_test_image(format: str = "JPEG") -> bytes:
    img = Image.new("RGB", (10, 10), color="red")
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


def _register_and_login(client: TestClient) -> str:
    email = f"test_{os.urandom(4).hex()}@example.com"
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": "securepass123", "privacy_accepted": True},
    )
    assert resp.status_code == 201
    return resp.json()["access_token"]


def _create_item(client: TestClient, token: str, **overrides) -> dict:
    name = overrides.get("name", "Test Item")
    category = overrides.get("category", "Oberteile")
    color = overrides.get("color", "Rot")
    brand = overrides.get("brand", "TestBrand")
    image_bytes = _make_test_image("JPEG")
    data = {"name": name, "category": category, "color": color, "brand": brand}
    files = {"image": ("test.jpg", io.BytesIO(image_bytes), "image/jpeg")}
    for k, v in list(data.items()):
        if v is not None:
            files[k] = (None, v)
    return client.post(
        "/api/items",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )


def test_list_items_empty() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = client.get("/api/items", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json() == []


def test_create_item_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Test Item"
        assert data["category"] == "Oberteile"
        assert data["color"] == "Rot"
        assert data["brand"] == "TestBrand"
        assert data["image_path"] is not None
        assert data["image_path"].startswith("http://") is False


def test_create_item_validates_category() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, category="InvalidCat")
        assert resp.status_code == 422


def test_create_item_validates_name_required() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, name="   ")
        assert resp.status_code == 422


def test_create_item_validates_name_length() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, name="A" * 101)
        assert resp.status_code == 422


def test_create_item_validates_color_length() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, color="A" * 51)
        assert resp.status_code == 422


def test_create_item_validates_brand_length() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, brand="A" * 51)
        assert resp.status_code == 422


def test_create_item_rejects_invalid_image_type() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        image_bytes = b"not an image"
        files = {
            "name": (None, "Test"),
            "category": (None, "Oberteile"),
            "image": ("test.txt", io.BytesIO(image_bytes), "text/plain"),
        }
        resp = client.post(
            "/api/items",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_item_rejects_large_image() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        large_image = b"x" * (5 * 1024 * 1024 + 1)
        files = {
            "name": (None, "Test"),
            "category": (None, "Oberteile"),
            "image": ("large.jpg", io.BytesIO(large_image), "image/jpeg"),
        }
        resp = client.post(
            "/api/items",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_item_without_image_fails() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        files = {
            "name": (None, "Test"),
            "category": (None, "Oberteile"),
        }
        resp = client.post(
            "/api/items",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422 or resp.status_code == 400


def test_create_item_optional_color_brand() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token, color=None, brand=None)
        assert resp.status_code == 201
        data = resp.json()
        assert data["color"] is None
        assert data["brand"] is None


def test_get_item_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        create_resp = _create_item(client, token)
        item_id = create_resp.json()["id"]

        resp = client.get(
            f"/api/items/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == item_id


def test_get_item_not_found() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = client.get(
            "/api/items/99999",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


def test_get_item_wrong_owner_returns_404() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)

        create_resp = _create_item(client, token1)
        item_id = create_resp.json()["id"]

        token2 = _register_and_login(client)
        resp = client.get(
            f"/api/items/{item_id}",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 404


def test_list_items_filter_by_category() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        _create_item(client, token, name="Shirt", category="Oberteile")
        _create_item(client, token, name="Jeans", category="Hosen")

        resp = client.get(
            "/api/items?category=Oberteile",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["name"] == "Shirt"


def test_list_items_filter_by_search() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        _create_item(client, token, name="Nike Shirt", brand="Nike")
        _create_item(client, token, name="Adidas Jeans", brand="Adidas")

        resp = client.get(
            "/api/items?search=Nike",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["name"] == "Nike Shirt"


def test_list_items_search_by_color() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        _create_item(client, token, name="Shirt", color="Blau")
        _create_item(client, token, name="Jeans", color="Rot")

        resp = client.get(
            "/api/items?search=Blau",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1


def test_list_items_only_own_items() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        token2 = _register_and_login(client)

        _create_item(client, token1, name="User1 Item")
        _create_item(client, token2, name="User2 Item")

        resp = client.get(
            "/api/items",
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["name"] == "User1 Item"


def test_update_item_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        create_resp = _create_item(client, token, name="Old Name")
        item_id = create_resp.json()["id"]

        files = {
            "name": (None, "New Name"),
            "category": (None, "Hosen"),
            "color": (None, "Blau"),
            "brand": (None, "NewBrand"),
        }
        resp = client.put(
            f"/api/items/{item_id}",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "New Name"
        assert data["category"] == "Hosen"
        assert data["color"] == "Blau"
        assert data["brand"] == "NewBrand"


def test_update_item_partial() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        create_resp = _create_item(client, token, name="Old Name", category="Oberteile")
        item_id = create_resp.json()["id"]

        files = {
            "name": (None, "Updated Name"),
        }
        resp = client.put(
            f"/api/items/{item_id}",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Updated Name"
        assert data["category"] == "Oberteile"


def test_update_item_replace_image() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        create_resp = _create_item(client, token, name="Old Name")
        item_id = create_resp.json()["id"]
        old_image_path = create_resp.json()["image_path"]

        png_bytes = _make_test_image("PNG")
        files = {
            "name": (None, "Updated"),
            "image": ("new.png", io.BytesIO(png_bytes), "image/png"),
        }
        resp = client.put(
            f"/api/items/{item_id}",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["image_path"] is not None
        assert data["image_path"] != old_image_path


def test_update_item_wrong_owner_returns_404() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        create_resp = _create_item(client, token1)
        item_id = create_resp.json()["id"]

        token2 = _register_and_login(client)
        files = {"name": (None, "Hacked")}
        resp = client.put(
            f"/api/items/{item_id}",
            files=files,
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 404


def test_delete_item_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        create_resp = _create_item(client, token)
        item_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/items/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == {"message": "Item deleted"}

        get_resp = client.get(
            f"/api/items/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert get_resp.status_code == 404


def test_delete_item_wrong_owner_returns_404() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        create_resp = _create_item(client, token1)
        item_id = create_resp.json()["id"]

        token2 = _register_and_login(client)
        resp = client.delete(
            f"/api/items/{item_id}",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 404


def test_protected_endpoints_require_auth() -> None:
    with TestClient(app) as client:
        resp = client.get("/api/items")
        assert resp.status_code in (401, 403)

        resp = client.get("/api/items/1")
        assert resp.status_code in (401, 403)

        resp = client.delete("/api/items/1")
        assert resp.status_code in (401, 403)

        resp = client.post("/api/items")
        assert resp.status_code in (401, 403)


def test_create_item_strips_exif() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = _create_item(client, token)
        assert resp.status_code == 201
        image_path = resp.json()["image_path"]
        from config import UPLOAD_DIR

        full_path = os.path.join(UPLOAD_DIR, image_path)
        assert os.path.isfile(full_path)
        saved_img = Image.open(full_path)
        exif = saved_img.getexif()
        assert not exif or len(exif) == 0


def test_create_item_png_accepted() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        png_bytes = _make_test_image("PNG")
        data = {"name": "PNG Item", "category": "Schuhe"}
        files = {"image": ("test.png", io.BytesIO(png_bytes), "image/png")}
        for k, v in data.items():
            files[k] = (None, v)
        resp = client.post(
            "/api/items",
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        assert resp.json()["image_path"].endswith(".png")
