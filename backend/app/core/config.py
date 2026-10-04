from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    local_storage_path: Path = Path(__file__).resolve().parents[2] / "data" / "store.json"
    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    database_url: SecretStr | None = None

    model_config = SettingsConfigDict(env_file=BACKEND_ENV_FILE, extra="ignore")


settings = Settings()
