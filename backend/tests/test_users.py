from fastapi.testclient import TestClient
from main import app


def _register_and_get_token(client: TestClient, email: str = "delete-me@example.com") -> str:
    resp = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "securepassword123",
            "privacy_accepted": True,
        },
    )
    assert resp.status_code == 201
    return resp.json()["access_token"]


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_delete_me_unauthenticated_returns_401() -> None:
    with TestClient(app) as client:
        resp = client.delete("/api/users/me")
        assert resp.status_code == 401


def test_delete_me_with_invalid_token_returns_401() -> None:
    with TestClient(app) as client:
        resp = client.delete("/api/users/me", headers=_auth_header("bogus-token"))
        assert resp.status_code == 401


def test_delete_me_success_returns_204() -> None:
    with TestClient(app) as client:
        token = _register_and_get_token(client, "todelete@example.com")
        resp = client.delete("/api/users/me", headers=_auth_header(token))
        assert resp.status_code == 204


def test_delete_me_removes_user_so_login_fails() -> None:
    with TestClient(app) as client:
        token = _register_and_get_token(client, "purge@example.com")

        resp = client.delete("/api/users/me", headers=_auth_header(token))
        assert resp.status_code == 204

        login_resp = client.post(
            "/api/auth/login",
            json={"email": "purge@example.com", "password": "securepassword123"},
        )
        assert login_resp.status_code == 401


def test_delete_me_preserves_other_users() -> None:
    with TestClient(app) as client:
        token_a = _register_and_get_token(client, "user-a@example.com")
        _register_and_get_token(client, "user-b@example.com")

        resp = client.delete("/api/users/me", headers=_auth_header(token_a))
        assert resp.status_code == 204

        login_resp = client.post(
            "/api/auth/login",
            json={"email": "user-b@example.com", "password": "securepassword123"},
        )
        assert login_resp.status_code == 200


def test_delete_me_second_call_with_same_token_returns_401() -> None:
    with TestClient(app) as client:
        token = _register_and_get_token(client, "once@example.com")
        resp1 = client.delete("/api/users/me", headers=_auth_header(token))
        assert resp1.status_code == 204

        resp2 = client.delete("/api/users/me", headers=_auth_header(token))
        assert resp2.status_code == 401
