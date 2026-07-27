# OfficeClauset – Kleiderschrank-Manager

Ein glamouröser Kleiderschrank-Manager mit Web-GUI im Hollywood-Stil. Benutzer registrieren sich, legen Kleidungsstücke mit Bildern und Kategorien an, durchstöbern ihre Garderobe und kombinieren im Outfit-Creator Einzelteile zu gespeicherten Outfits – alles in einer eleganten Red-Carpet-Optik mit tiefschwarzem Hintergrund, goldenen Akzenten und Playfair-Display-Typografie.

## Tech Stack

- **Backend:** Python FastAPI, SQLAlchemy, SQLite, JWT (python-jose + bcrypt)
- **Frontend:** Vite + React (TypeScript), Tailwind CSS mit Custom-Theme
- **Storage:** Lokales Dateisystem für Uploads
- **Auth:** JWT-Authentifizierung

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Entwicklung starten

### Backend

```bash
cd backend
uvicorn main:app --reload
```

Das Backend läuft unter `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm run dev
```

Das Frontend läuft unter `http://localhost:5173`.

## Umgebungsvariablen

| Variable | Beschreibung | Default |
|---|---|---|
| `DB_PATH` | Pfad zur SQLite-Datenbank | `officeclauset.db` (im `backend/` Verzeichnis) |
| `JWT_SECRET` | Geheimer Schlüssel für JWT-Signatur | `dev-secret-change-in-production` |
| `JWT_EXPIRY` | Ablaufzeit der JWT-Tokens in Stunden | `24` |
| `UPLOAD_DIR` | Verzeichnis für Bild-Uploads | `backend/uploads/` |

## API-Endpunkte

### Allgemein

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/health` | Health-Check – liefert `{"status": "ok"}` |
| `POST` | `/api/auth/health` | Auth-Router Health-Check |
| `GET` | `/api/items/health` | Items-Router Health-Check |
| `GET` | `/api/outfits/health` | Outfits-Router Health-Check |
| `GET` | `/api/users/health` | Users-Router Health-Check |

### Auth (`/api/auth`)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/auth/register` | Registrierung (Ticket #1) |
| `POST` | `/api/auth/login` | Login (Ticket #1) |

### Kleidungsstücke (`/api/items`)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/items` | Galerie (Ticket #4) |
| `POST` | `/api/items` | Neues Kleidungsstück (Ticket #4) |
| `GET` | `/api/items/{id}` | Detailansicht (Ticket #4) |
| `PUT` | `/api/items/{id}` | Bearbeiten (Ticket #4) |
| `DELETE` | `/api/items/{id}` | Löschen (Ticket #4) |

### Outfits (`/api/outfits`)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/outfits` | Outfit-Übersicht (Ticket #2) |
| `POST` | `/api/outfits` | Neues Outfit (Ticket #2) |
| `GET` | `/api/outfits/{id}` | Outfit-Detail (Ticket #2) |
| `DELETE` | `/api/outfits/{id}` | Outfit löschen (Ticket #2) |

### Benutzer (`/api/users`)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `DELETE` | `/api/users/me` | Konto löschen (Ticket #3) |

## Features

- **Health-Endpoints:** Jeder Router liefert einen Health-Check für Monitoring
- **Hollywood-Glamour-UI:** Dunkle Farbpalette (#0A0A0A, #141414), goldene Akzente (#FFD700, #DAA520), Playfair Display & Inter Typografie
- **JWT-Authentifizierung:** Sichere Token-basierte Auth mit bcrypt-Passworthashing
- **Kleidungsstück-Management:** CRUD für Kleidungsstücke mit Bild-Upload
- **Outfit-Creator:** Kombinieren Sie Kleidungsstücke zu Outfits
- **Geschützte Routen:** Frontend-Routing mit Auth-Guards
- **Responsive Design:** Optimiert für Mobile, Tablet und Desktop
