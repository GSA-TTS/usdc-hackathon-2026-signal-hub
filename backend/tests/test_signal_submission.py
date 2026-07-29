import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from backend.sqlite_db import Agency, Alerts, FraudID, create_db_and_tables, engine, Signal
from sqlmodel import Session
from backend.app import ReportPayload, create_report, get_agency_signals


def test_create_db_and_tables_and_insert_signal(tmp_path):
    create_db_and_tables()
    with Session(engine) as session:
        signal = Signal(
            fraud_id=1,
            agency_id=1,
            severity='high',
            primary_category='identity-theft',
        )
        session.add(signal)
        session.commit()
        session.refresh(signal)

    assert signal.id is not None


def test_report_payload_allows_missing_report_date():
    payload = ReportPayload(
        agency='IRS',
        digest='abc123',
        severity='high',
        fraudCategory='identity-theft',
        confidence=90,
    )

    assert payload.report_date is None


def test_get_agency_signals_only_returns_matches_for_that_agency():
    create_db_and_tables()
    with Session(engine) as session:
        session.query(Signal).delete()
        session.query(FraudID).delete()
        session.query(Agency).delete()
        session.query(Alerts).delete()
        session.commit()

        irs = Agency(name='irs')
        ssa = Agency(name='ssa')
        session.add_all([irs, ssa])
        session.commit()
        session.refresh(irs)
        session.refresh(ssa)

        fraud_one = FraudID(ssn='one')
        fraud_two = FraudID(ssn='two')
        session.add_all([fraud_one, fraud_two])
        session.commit()
        session.refresh(fraud_one)
        session.refresh(fraud_two)

        signal_one = Signal(
            fraud_id=fraud_one.id,
            agency_id=irs.id,
            severity='high',
            primary_category='identity-theft',
            confidence='high',
        )
        signal_two = Signal(
            fraud_id=fraud_two.id,
            agency_id=ssa.id,
            severity='low',
            primary_category='loan-fraud',
            confidence='low',
        )
        session.add_all([signal_one, signal_two])
        session.commit()

    results = get_agency_signals('irs')

    assert len(results) == 1
    assert results[0]['agency'] == 'IRS'
    assert results[0]['fraudCategory'] == 'identity-theft'


def test_create_report_creates_alert_for_matching_fraud_id():
    create_db_and_tables()
    with Session(engine) as session:
        session.query(Signal).delete()
        session.query(FraudID).delete()
        session.query(Agency).delete()
        session.query(Alerts).delete()
        session.commit()

        agency_one = Agency(name='irs')
        agency_two = Agency(name='ssa')
        session.add_all([agency_one, agency_two])
        session.commit()
        session.refresh(agency_one)
        session.refresh(agency_two)

        fraud = FraudID(ssn='shared-fraud')
        session.add(fraud)
        session.commit()
        session.refresh(fraud)

        initial_signal = Signal(
            fraud_id=fraud.id,
            agency_id=agency_one.id,
            severity='high',
            primary_category='identity-theft',
            confidence='high',
        )
        session.add(initial_signal)
        session.commit()
        session.refresh(initial_signal)

    payload = ReportPayload(
        agency='ssa',
        digest='shared-fraud',
        severity='medium',
        fraudCategory='identity-theft',
        confidence='medium',
    )

    result = create_report(payload)

    with Session(engine) as session:
        alerts = session.query(Alerts).filter(Alerts.fraud_id == result['fraudId']).all()
        assert len(alerts) == 1
        assert alerts[0].agency_ct == 2
        assert len(alerts[0].report_ids) == 2
        assert result['alertId'] is not None
