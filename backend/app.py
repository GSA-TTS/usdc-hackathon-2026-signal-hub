from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

try:
    from backend.sqlite_db import Agency, FraudID, Signal, create_db_and_tables, get_session
except ModuleNotFoundError:
    from sqlite_db import Agency, FraudID, Signal, create_db_and_tables, get_session

app = FastAPI(title="Signal Hub API")


class ReportPayload(BaseModel):
    agency: str
    digest: str
    severity: str
    fraudCategory: str
    confidence: int | str
    report_date: datetime | None = None


@app.on_event("startup")
def startup_event() -> None:
    create_db_and_tables()


@app.get("/agencies/{agency_name}/signals")
def get_agency_signals(agency_name: str) -> list[dict[str, object]]:
    with get_session() as session:
        agency = session.query(Agency).filter(Agency.name == agency_name.lower()).first()
        if agency is None:
            raise HTTPException(status_code=404, detail="Agency not found")

        signals = (
            session.query(Signal)
            .filter(Signal.agency_id == agency.id)
            .order_by(Signal.timestamp.desc())
            .all()
        )

        return [
            {
                "id": signal.id,
                "agency": agency.name.upper(),
                "fraudCategory": signal.primary_category,
                "severity": signal.severity,
                "confidence": signal.confidence,
                "submittedAt": signal.timestamp.strftime("%Y-%m-%d"),
                "reportDate": signal.report_date.isoformat() if signal.report_date else None,
            }
            for signal in signals
        ]


@app.post("/reports")
def create_report(payload: ReportPayload) -> dict[str, object]:
    with get_session() as session:
        agency_name = payload.agency.lower()
        agency = session.query(Agency).filter(Agency.name == agency_name).first()
        if agency is None:
            agency = Agency(name=agency_name)
            session.add(agency)
            session.commit()
            session.refresh(agency)

        fraud = session.query(FraudID).filter(FraudID.ssn == payload.digest).first()
        if fraud is None:
            fraud = FraudID(ssn=payload.digest)
            session.add(fraud)
            session.commit()
            session.refresh(fraud)

        signal = Signal(
            fraud_id=fraud.id,
            agency_id=agency.id,
            severity=payload.severity,
            primary_category=payload.fraudCategory,
            confidence=str(payload.confidence),
            report_date=payload.report_date or datetime.now(timezone.utc),
        )
        session.add(signal)
        session.commit()
        session.refresh(signal)

        return {
            "ok": True,
            "signalId": signal.id,
            "agencyId": agency.id,
            "fraudId": fraud.id,
            "reportDate": signal.report_date.isoformat(),
        }
