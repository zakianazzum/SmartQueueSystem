import os
from typing import Optional

from dotenv import load_dotenv
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

if not os.getenv("SQLALCHEMY_DATABASE_URI"):
    load_dotenv()


class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "SmartQueue Backend"

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # one week
    JWT_SECRET_KEY: str = os.environ["JWT_SECRET_KEY"]

    # DB
    SQLALCHEMY_DATABASE_URI: Optional[str] = os.environ["SQLALCHEMY_DATABASE_URI"]

    # openai
    # OPENAI_API_KEY: Optional[str] = os.environ["OPENAI_API_KEY"]


settings = Settings()
