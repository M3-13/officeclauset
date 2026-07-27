import io
import uuid

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
    email = f"test_{uuid.uuid4().hex}@example.com"
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": "securepass123", "privacy_accepted": True},
    )
    assert resp.status_code == 201
    return resp.json()["access_token"]


def _create_item(
    client: TestClient,
    token: str,
    name: str = "Test Item",
    category: str = "Oberteile",
) -> dict:
    image_bytes = _make_test_image("JPEG")
    files: dict = {
        "name": (None, name),
        "category": (None, category),
        "image": ("test.jpg", io.BytesIO(image_bytes), "image/jpeg"),
    }
    resp = client.post(
        "/api/items",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    return resp.json()


def test_list_outfits_empty() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = client.get("/api/outfits", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json() == []


def test_create_outfit_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        shirt = _create_item(client, token, name="Shirt", category="Oberteile")
        jeans = _create_item(client, token, name="Jeans", category="Hosen")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Mein Outfit",
                "items": [
                    {"clothing_item_id": shirt["id"], "category": "Oberteile"},
                    {"clothing_item_id": jeans["id"], "category": "Hosen"},
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Mein Outfit"
        assert len(data["items"]) == 2

        categories = {it["category"] for it in data["items"]}
        assert categories == {"Oberteile", "Hosen"}

        for item in data["items"]:
            assert item["clothing_item"] is not None
            assert item["clothing_item"]["id"] in {shirt["id"], jeans["id"]}


def test_create_outfit_name_required() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "   ",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_name_too_long() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "A" * 101,
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_no_items() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)

        resp = client.post(
            "/api/outfits",
            json={"name": "Leer", "items": []},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_duplicate_category() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        shirt1 = _create_item(client, token, name="Shirt 1", category="Oberteile")
        shirt2 = _create_item(client, token, name="Shirt 2", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Duplikat",
                "items": [
                    {"clothing_item_id": shirt1["id"], "category": "Oberteile"},
                    {"clothing_item_id": shirt2["id"], "category": "Oberteile"},
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_invalid_category() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Falsch",
                "items": [{"clothing_item_id": item["id"], "category": "InvalidCat"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_category_mismatch() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        shirt = _create_item(client, token, name="Shirt", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Mismatch",
                "items": [{"clothing_item_id": shirt["id"], "category": "Hosen"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_item_not_found() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Nicht vorhanden",
                "items": [{"clothing_item_id": 99999, "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422


def test_create_outfit_other_users_item() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        token2 = _register_and_login(client)

        item1 = _create_item(client, token1, name="Shirt", category="Oberteile")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Fremd",
                "items": [{"clothing_item_id": item1["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 422


def test_get_outfit_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        create_resp = client.post(
            "/api/outfits",
            json={
                "name": "Mein Outfit",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        outfit_id = create_resp.json()["id"]

        resp = client.get(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == outfit_id
        assert data["name"] == "Mein Outfit"
        assert len(data["items"]) == 1
        assert data["items"][0]["clothing_item"]["name"] == "Shirt"


def test_get_outfit_not_found() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        resp = client.get(
            "/api/outfits/99999",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


def test_get_outfit_wrong_owner() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        token2 = _register_and_login(client)
        item = _create_item(client, token1, name="Shirt", category="Oberteile")

        create_resp = client.post(
            "/api/outfits",
            json={
                "name": "Mein Outfit",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token1}"},
        )
        outfit_id = create_resp.json()["id"]

        resp = client.get(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 404


def test_list_outfits_only_own() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        token2 = _register_and_login(client)

        item1 = _create_item(client, token1, name="Shirt", category="Oberteile")
        item2 = _create_item(client, token2, name="Jacke", category="Jacken")

        client.post(
            "/api/outfits",
            json={
                "name": "Outfit 1",
                "items": [{"clothing_item_id": item1["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token1}"},
        )
        client.post(
            "/api/outfits",
            json={
                "name": "Outfit 2",
                "items": [{"clothing_item_id": item2["id"], "category": "Jacken"}],
            },
            headers={"Authorization": f"Bearer {token2}"},
        )

        resp = client.get(
            "/api/outfits",
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Outfit 1"


def test_delete_outfit_success() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        create_resp = client.post(
            "/api/outfits",
            json={
                "name": "Zum Löschen",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        outfit_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == {"message": "Outfit deleted"}

        get_resp = client.get(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert get_resp.status_code == 404


def test_delete_outfit_wrong_owner() -> None:
    with TestClient(app) as client:
        token1 = _register_and_login(client)
        token2 = _register_and_login(client)
        item = _create_item(client, token1, name="Shirt", category="Oberteile")

        create_resp = client.post(
            "/api/outfits",
            json={
                "name": "Mein Outfit",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token1}"},
        )
        outfit_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert resp.status_code == 404


def test_outfit_items_cascade_on_delete() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        item = _create_item(client, token, name="Shirt", category="Oberteile")

        create_resp = client.post(
            "/api/outfits",
            json={
                "name": "Outfit",
                "items": [{"clothing_item_id": item["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        outfit_id = create_resp.json()["id"]

        client.delete(
            f"/api/outfits/{outfit_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        resp = client.get(
            "/api/outfits",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []


def test_protected_endpoints_require_auth() -> None:
    with TestClient(app) as client:
        resp = client.get("/api/outfits")
        assert resp.status_code in (401, 403)

        resp = client.get("/api/outfits/1")
        assert resp.status_code in (401, 403)

        resp = client.post("/api/outfits", json={"name": "X", "items": []})
        assert resp.status_code in (401, 403)

        resp = client.delete("/api/outfits/1")
        assert resp.status_code in (401, 403)


def test_outfit_list_includes_items() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        shirt = _create_item(client, token, name="Shirt", category="Oberteile")

        client.post(
            "/api/outfits",
            json={
                "name": "Outfit mit Items",
                "items": [{"clothing_item_id": shirt["id"], "category": "Oberteile"}],
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        resp = client.get(
            "/api/outfits",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert len(data[0]["items"]) == 1
        assert data[0]["items"][0]["clothing_item"] is not None


def test_create_outfit_multiple_categories() -> None:
    with TestClient(app) as client:
        token = _register_and_login(client)
        shirt = _create_item(client, token, name="Shirt", category="Oberteile")
        jeans = _create_item(client, token, name="Jeans", category="Hosen")
        shoes = _create_item(client, token, name="Sneaker", category="Schuhe")
        jacket = _create_item(client, token, name="Blazer", category="Jacken")

        resp = client.post(
            "/api/outfits",
            json={
                "name": "Komplettes Outfit",
                "items": [
                    {"clothing_item_id": shirt["id"], "category": "Oberteile"},
                    {"clothing_item_id": jeans["id"], "category": "Hosen"},
                    {"clothing_item_id": shoes["id"], "category": "Schuhe"},
                    {"clothing_item_id": jacket["id"], "category": "Jacken"},
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert len(data["items"]) == 4
