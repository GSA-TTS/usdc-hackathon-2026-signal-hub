# Signal Hub — Fraud Signal Sharing Service (FS3)

Signal Hub is a proof of concept for the **Fraud Signal Sharing Service (FS3)**: a GSA-operated inter-agency platform that lets federal agencies discover when they've independently flagged the same subject for fraud, without ever exchanging raw personally identifiable information (PII).

## About the Project

Federal agencies detect and investigate fraud independently across benefits, loans, grants, tax, procurement, and healthcare programs. When a fraudulent actor targets multiple programs at once, no reliable mechanism exists today for agencies to share what they know with each other in a timely, structured, or privacy-safe way — so each agency re-investigates from scratch while the actor keeps operating across programs.

FS3 solves this without centralizing PII. Reporting agencies compute a keyed HMAC-SHA-256 digest of a subject identifier (e.g., an SSN) client-side, using a shared secret key managed by GSA, before ever transmitting it. Two agencies that independently hash the same identifier produce the same digest, so GSA can detect a match and issue a corroborated alert — without either agency's raw data ever leaving its own system, and without GSA ever seeing the plaintext identifier.

FS3 is **not** a case management system, **not** a PII database, **not** a real-time identity verification service, and an FS3 alert is corroborating intelligence, not a determination of guilt or ineligibility. See [`docs/Signal Description.pdf`](docs/Signal%20Description.pdf) for the full problem statement, design principles, and PoC scope (must-have and stretch requirements).

## Repository Structure

```plaintext
.
├── backend/          FastAPI service — report submission, SQLModel/SQLite storage
│   ├── app.py            API entrypoint (currently: POST /reports)
│   ├── sqlite_db.py       SQLModel models (Agency, FraudID, Signal) + session/engine setup
│   └── tests/             Backend test suite
├── frontend/         React + Vite UI, styled with USWDS (@trussworks/react-uswds)
│   └── src/               App components, multi-agency simulation UI
└── docs/             Project spec and reference docs
    ├── Signal Description.pdf   Full FS3 problem statement, design, and PoC requirements
    ├── field_descriptions.md    Fraud category and severity level definitions
    └── usai_output.md           Notes on the USWDS frontend migration
```

## Local Development

This project is a monorepo with a FastAPI backend and a React frontend.

### Backend (FastAPI + SQLModel)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. On startup it creates `shared_signals.db` (SQLite) if it doesn't already exist.

### Frontend (React + Vite + USWDS)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend expects the backend at `http://localhost:8000` by default (override with a `VITE_API_BASE` env var).

## Testing and Linting

- **Backend:** tests live in `backend/tests/` (run with `pytest` from the `backend/` directory).
- **Frontend:** `npm run lint` (ESLint, configured in `frontend/eslint.config.js`).

## License

This project is released under the [CC0 1.0 Universal public domain dedication](LICENSE).