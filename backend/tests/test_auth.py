from fastapi.testclient import TestClient
from main import app

VALID_EMAIL = "test@example.com"
VALID_PASSWORD = "securepassword123"


def _register(
    client: TestClient,
    email: str = VALID_EMAIL,
    password: str = VALID_PASSWORD,
) -> dict:
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "privacy_consent": True},
    )
    return resp.json()


def test_register_creates_user_and_returns_token() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "validpass123",
                "privacy_consent": True,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "newuser@example.com"
        assert "id" in data["user"]


def test_register_rejects_short_password() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "shortpass@example.com",
                "password": "1234567",
                "privacy_consent": True,
            },
        )
        assert resp.status_code == 422


def test_register_rejects_missing_privacy_consent() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "noprivacy@example.com",
                "password": "validpass123",
                "privacy_consent": False,
            },
        )
        assert resp.status_code == 422


def test_register_rejects_duplicate_email() -> None:
    with TestClient(app) as client:
        client.post(
            "/api/auth/register",
            json={
                "email": "dupe@example.com",
                "password": "validpass123",
                "privacy_consent": True,
            },
        )
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "dupe@example.com",
                "password": "validpass456",
                "privacy_consent": True,
            },
        )
        assert resp.status_code == 409


def test_login_successful() -> None:
    with TestClient(app) as client:
        _register(client, "logintest@example.com")
        resp = client.post(
            "/api/auth/login",
            json={"email": "logintest@example.com", "password": VALID_PASSWORD},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "logintest@example.com"


def test_login_rejects_wrong_password() -> None:
    with TestClient(app) as client:
        _register(client, "wrongpw@example.com")
        resp = client.post(
            "/api/auth/login",
            json={"email": "wrongpw@example.com", "password": "wrongpassword1"},
        )
        assert resp.status_code == 401


def test_login_rejects_nonexistent_user() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "somepassword"},
        )
        assert resp.status_code == 401


def test_login_rejects_invalid_email_format() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/login",
            json={"email": "not-an-email", "password": "somepassword"},
        )
        assert resp.status_code == 422


def test_register_rejects_invalid_email_format() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "not-an-email",
                "password": "validpass123",
                "privacy_consent": True,
            },
        )
        assert resp.status_code == 422


def test_logout_returns_success() -> None:
    with TestClient(app) as client:
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 200
        assert resp.json() == {"message": "Logged out successfully"}


def test_protected_endpoint_health_reachable_without_token() -> None:
    with TestClient(app) as client:
        resp = client.get("/api/items/health")
        assert resp.status_code == 200


def test_register_and_login_flow() -> None:
    with TestClient(app) as client:
        reg_resp = client.post(
            "/api/auth/register",
            json={
                "email": "flowtest@example.com",
                "password": "flowpass123",
                "privacy_consent": True,
            },
        )
        assert reg_resp.status_code == 201
        assert "access_token" in reg_resp.json()

        login_resp = client.post(
            "/api/auth/login",
            json={"email": "flowtest@example.com", "password": "flowpass123"},
        )
        assert login_resp.status_code == 200
        assert "access_token" in login_resp.json()
        assert login_resp.json()["user"]["email"] == "flowtest@example.com"


def test_token_verification_works() -> None:
    from auth import create_access_token, verify_token

    token = create_access_token({"sub": "42"})
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert "exp" in payload


def test_password_hashing_and_verification() -> None:
    from auth import get_password_hash, verify_password

    pw = "mysecretpassword"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed)
    assert not verify_password("wrongpassword", hashed)
