from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

try:
    from backend.sqlite_db import Agency, Alerts, FraudID, Signal, create_db_and_tables, get_session
except ModuleNotFoundError:
    from sqlite_db import Agency, Alerts, FraudID, Signal, create_db_and_tables, get_session

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


@app.get("/alerts")
def get_alerts() -> list[dict[str, object]]:
    with get_session() as session:
        alerts = session.query(Alerts).order_by(Alerts.alert_date.desc()).all()
        return [
            {
                "id": alert.id,
                "fraudId": alert.fraud_id,
                "agencyCt": alert.agency_ct,
                "reportCt": len(alert.report_ids or []),
                "alertDate": alert.alert_date.strftime("%Y-%m-%d %H:%M"),
            }
            for alert in alerts
        ]


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
                "fraudId": signal.fraud_id,
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
        is_new_fraud = fraud is None
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

        matching_signals = session.query(Signal).filter(Signal.fraud_id == fraud.id).all()
        unique_agencies = {signal.agency_id for signal in matching_signals if signal.agency_id is not None}
        fraud.report_ct = len(matching_signals)
        fraud.agency_ct = len(unique_agencies)
        session.add(fraud)

        alert = None
        if not is_new_fraud and len(matching_signals) > 1:
            report_ids = [signal.id for signal in matching_signals if signal.id is not None]
            report_dates = [
                signal.report_date.isoformat() if signal.report_date is not None else None
                for signal in matching_signals
            ]
            categories = [signal.primary_category for signal in matching_signals if signal.primary_category]
            severities = [signal.severity for signal in matching_signals if signal.severity]
            signal_types = [signal.primary_category for signal in matching_signals if signal.primary_category]

            alert = Alerts(
                fraud_id=fraud.id,
                report_ids=report_ids,
                report_dates=report_dates,
                agency_ct=len(unique_agencies),
                categories=categories,
                signal_types=signal_types,
                severities=severities,
            )
            session.add(alert)
            session.commit()
            session.refresh(alert)

        return {
            "ok": True,
            "signalId": signal.id,
            "agencyId": agency.id,
            "fraudId": fraud.id,
            "alertId": alert.id if alert is not None else None,
            "agencyCount": alert.agency_ct if alert is not None else None,
            "reportCount": len(alert.report_ids or []) if alert is not None else None,
            "reportDate": signal.report_date.isoformat(),
        }
