import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlite_db import create_db_and_tables, engine, Signal
from sqlmodel import Session


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
