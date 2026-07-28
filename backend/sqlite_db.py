from pathlib import Path

from sqlmodel import Field, SQLModel, Session, create_engine, Relationship

DB_PATH = Path(__file__).resolve().parent / "shared_signals.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL)


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

    fraud: FraudID | None = Relationship()  # SQLModel relationship stub
    agency: Agency | None = Relationship(back_populates="signals")


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    print(f"Database created at: {DB_PATH}")


if __name__ == "__main__":
    create_db_and_tables()
