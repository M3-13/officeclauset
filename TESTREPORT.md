VERDICT: BUGS_FOUND

- **Title**: CORS-Allow-Origins verhindern API-Zugriff vom Playwright-Test-Frontend (beliebiger Port)
- **Symptom**: Nach erfolgreicher Registrierung oder Login leitet das Frontend nicht zur Galerie weiter – die Seite bleibt bei der Login-/Registrierungsansicht hängen, der Test wartet vergeblich auf das `<h1>`-Element mit dem Text „Galerie“ und läuft in einen Timeout. Sämtliche geschützten Flows (Galerie anzeigen, Items erstellen/filtern, Outfits erstellen, Account löschen) sind aus dem Browser heraus nicht erreichbar. Der Nutzer kann die Kernfunktionen der Anwendung nicht nutzen.
- **Repro**: Beliebigen Playwright-E2E-Test mit Login ausführen (z. B. `e2e\auth.spec.cjs`, `e2e\gallery.spec.cjs`, `e2e\outfits.spec.cjs`, `e2e\security.spec.cjs`). Der Testserver serviert das Frontend auf einem dynamischen Port (z. B. 59566), der nicht in der `allow_origins`-Liste des Backends enthalten ist. Die fetch‑Anfragen nach `/api/auth/register` oder `/api/auth/login` werden vom Browser aufgrund der CORS‑Policy abgewiesen.
- **Evidence**:
  - `Error: expect(locator).toContainText(expected) failed`
  - `Expected substring: "Galerie"`
  - `Error: element(s) not found`
  - `Test timeout of 12000ms exceeded.`
  - Die 25 fehlgeschlagenen Tests zeigen alle denselben Timeout in der `registerAndLogin`‑Hilfsfunktion nach dem Submit des Login‑Formulars.
- **Suspected file(s)**: `backend/main.py` – `allow_origins`‑Liste enthält nur `localhost:5173`, `localhost:5174`, `localhost:3000`, aber nicht den Port des Test‑Frontend‑Servers. Der Companion‑Backend läuft laut Report auf Port 8000 und ist erreichbar; die Anfragen scheitern rein an der CORS‑Ablehnung im Browser.
- **Severity**: **critical** – die gesamte geschützte Anwendung (Registrierung, Login, Galerie, Outfits, Einstellungen) ist für einen Benutzer, der das Frontend über einen nicht explizit gelisteten Port bezieht, funktionsunfähig.