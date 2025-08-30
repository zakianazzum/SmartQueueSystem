from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, pool_size=32, max_overflow=20, pool_pre_ping=True
)

session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    db = session_local()
    try:
        yield db
    finally:
        db.close()
