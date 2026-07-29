from fastapi import FastAPI
from pydantic import BaseModel

from backend.sqlite_db import Agency, FraudID, Signal, create_db_and_tables, get_session

app = FastAPI(title="Signal Hub API")


class ReportPayload(BaseModel):
    agency: str
    digest: str
    severity: str
    fraudCategory: str
    confidence: int


@app.on_event("startup")
def startup_event() -> None:
    create_db_and_tables()


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
        )
        session.add(signal)
        session.commit()
        session.refresh(signal)

        return {
            "ok": True,
            "signalId": signal.id,
            "agencyId": agency.id,
            "fraudId": fraud.id,
        }
