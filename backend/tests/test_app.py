from fastapi.testclient import TestClient
from main import app


def test_health_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_router_health_endpoints() -> None:
    with TestClient(app) as client:
        for prefix in ["/api/auth", "/api/items", "/api/outfits", "/api/users"]:
            response = client.get(f"{prefix}/health")
            assert response.status_code == 200
            assert response.json() == {"status": "ok"}


def test_root_router_health() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_cors_headers() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/health",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers


def test_database_tables_created() -> None:
    from database import engine
    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    expected = {"users", "clothing_items", "outfits", "outfit_items"}
    assert expected.issubset(set(tables))
