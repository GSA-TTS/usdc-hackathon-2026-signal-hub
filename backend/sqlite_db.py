from pathlib import Path
from datetime import datetime, timezone
from typing import List

from sqlmodel import Field, SQLModel, Session, create_engine, Relationship, Column, JSON

DB_PATH = Path(__file__).resolve().parent / "shared_signals.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL)


def get_session() -> Session:
    return Session(engine)


class FraudID(SQLModel, table=True):
    __tablename__ = "fraud_id"

    id: int | None = Field(default=None, primary_key=True)
    ssn: str


class Agency(SQLModel, table=True):
    __tablename__ = "agency"

    id: int | None = Field(default=None, primary_key=True)
    name: str

    signals: list["Signal"] = Relationship(back_populates="agency")


class Signal(SQLModel, table=True):
    __tablename__ = "signal"

    id: int | None = Field(default=None, primary_key=True)
    fraud_id: int | None = Field(default=None, foreign_key="fraud_id.id")
    agency_id: int | None = Field(default=None, foreign_key="agency.id")
    severity: str
    primary_category: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    fraud: FraudID | None = Relationship()  # SQLModel relationship stub
    agency: Agency | None = Relationship(back_populates="signals")

class Alerts(SQLModel, table=True):
    __tablename__ = "alerts"

    id: int | None = Field(default=None, primary_key=True)
    fraud_id: int | None = Field(default=None, foreign_key="fraud_id.id")
    report_ids: List[int] | None = Field(default=[], sa_column=Column(JSON))
    report_dates: List[datetime] | None = Field(default=[], sa_column=Column(JSON))
    agency_ct: int | None = Field(default=None)
    categories: List[str] = Field(default=[], sa_column=Column(JSON))
    signal_types: List[str] = Field(default=[], sa_column=Column(JSON))
    severities: List[str] = Field(default=[], sa_column=Column(JSON))
    alert_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    print(f"Database created at: {DB_PATH}")


if __name__ == "__main__":
    create_db_and_tables()
