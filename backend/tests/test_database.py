import unittest
from types import SimpleNamespace
from unittest.mock import patch

import psycopg
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.main import app


class DatabaseHealthTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.config = SimpleNamespace(database_url=None)
        self.settings_patch = patch("app.core.database.settings", self.config)
        self.settings_patch.start()
        self.addCleanup(self.settings_patch.stop)

    def test_missing_setting_does_not_attempt_connection(self):
        with patch("app.core.database.psycopg.connect") as connect:
            response = self.client.get("/api/health/database")
        self.assertEqual(response.status_code, 503)
        self.assertIn("DATABASE_URL", response.json()["detail"])
        connect.assert_not_called()

    def test_password_placeholder_does_not_attempt_connection(self):
        self.config.database_url = SecretStr(
            "postgresql://postgres:[YOUR-PASSWORD]@localhost:5432/postgres"
        )
        with patch("app.core.database.psycopg.connect") as connect:
            response = self.client.get("/api/health/database")
        self.assertEqual(response.status_code, 503)
        self.assertIn("placeholder", response.json()["detail"])
        connect.assert_not_called()

    def test_failed_connection_does_not_expose_driver_details(self):
        self.config.database_url = SecretStr("postgresql://postgres:test@localhost/postgres")
        with patch(
            "app.core.database.psycopg.connect",
            side_effect=psycopg.OperationalError("private-driver-error"),
        ):
            response = self.client.get("/api/health/database")
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("private-driver-error", response.text)
        self.assertNotIn(self.config.database_url.get_secret_value(), response.text)

    def test_success_checks_database_with_tls_and_closes_connection(self):
        self.config.database_url = SecretStr("postgresql://postgres:test@localhost/postgres")
        with patch("app.core.database.psycopg.connect") as connect:
            connection = connect.return_value.__enter__.return_value
            connection.execute.return_value.fetchone.return_value = (1,)
            response = self.client.get("/api/health/database")
            connect.return_value.__exit__.assert_called_once()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "postgresql"})
        connection.execute.assert_called_once_with("SELECT 1")
        self.assertEqual(connect.call_args.kwargs["sslmode"], "require")
        self.assertEqual(connect.call_args.kwargs["connect_timeout"], 5)


if __name__ == "__main__":
    unittest.main()
