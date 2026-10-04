import psycopg
from psycopg.conninfo import conninfo_to_dict

from app.core.config import settings


class DatabaseUnavailableError(RuntimeError):
    """A safe database error that can be returned without revealing credentials."""


def connect_database() -> psycopg.Connection:
    """Open a TLS connection; callers must close it or use it as a context manager."""
    if not settings.database_url or not settings.database_url.get_secret_value().strip():
        raise DatabaseUnavailableError("Set DATABASE_URL in backend/.env")

    connection_string = settings.database_url.get_secret_value().strip()
    try:
        parameters = conninfo_to_dict(connection_string)
    except psycopg.Error:
        raise DatabaseUnavailableError(
            "DATABASE_URL is not a valid PostgreSQL connection string"
        ) from None

    if parameters.get("password") in {
        "[YOUR-PASSWORD]",
        "YOUR-PASSWORD",
        "REPLACE_WITH_URL_ENCODED_DATABASE_PASSWORD",
    }:
        raise DatabaseUnavailableError("Replace the password placeholder in backend/.env locally")

    try:
        return psycopg.connect(
            connection_string,
            sslmode="require",
            connect_timeout=5,
            options="-c statement_timeout=5000",
        )
    except (psycopg.Error, ValueError):
        raise DatabaseUnavailableError(
            "Database connection failed; check DATABASE_URL, the password, and network access"
        ) from None


def check_database_connection() -> None:
    try:
        with connect_database() as connection:
            result = connection.execute("SELECT 1").fetchone()
            if result != (1,):
                raise DatabaseUnavailableError("Database readiness check failed")
    except psycopg.Error:
        raise DatabaseUnavailableError("Database readiness check failed") from None
