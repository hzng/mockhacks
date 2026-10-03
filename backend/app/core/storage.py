import json
from pathlib import Path
from threading import RLock
from typing import Any


class LocalJsonStore:
    """Small file-backed key-value store for local development."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = RLock()

    def check_ready(self) -> bool:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        return self.path.parent.is_dir()

    def get(self, key: str) -> Any:
        with self._lock:
            values = self._read()
            if key not in values:
                raise KeyError(key)
            return values[key]

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            values = self._read()
            values[key] = value
            self._write(values)

    def delete(self, key: str) -> None:
        with self._lock:
            values = self._read()
            if key not in values:
                raise KeyError(key)
            del values[key]
            self._write(values)

    def list_keys(self) -> list[str]:
        with self._lock:
            return sorted(self._read())

    def _read(self) -> dict[str, Any]:
        if not self.path.exists():
            return {}
        try:
            values = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Local storage file is not valid JSON: {self.path}") from exc
        if not isinstance(values, dict):
            raise RuntimeError(f"Local storage file must contain a JSON object: {self.path}")
        return values

    def _write(self, values: dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
        temporary_path.write_text(json.dumps(values, indent=2), encoding="utf-8")
        temporary_path.replace(self.path)
