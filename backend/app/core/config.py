from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    local_storage_path: Path = Path(__file__).resolve().parents[2] / "data" / "store.json"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
