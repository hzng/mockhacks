from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import settings


class SupabaseUnavailableError(RuntimeError):
    """Raised when Supabase is unconfigured or its Auth API cannot be reached."""


def check_supabase_auth() -> None:
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise SupabaseUnavailableError("Supabase is not configured")

    request = Request(
        f"{settings.supabase_url.rstrip('/')}/auth/v1/settings",
        headers={"apikey": settings.supabase_publishable_key},
    )
    try:
        with urlopen(request, timeout=5) as response:
            if response.status < 200 or response.status >= 300:
                raise SupabaseUnavailableError("Supabase Auth returned an unsuccessful response")
    except (HTTPError, URLError, TimeoutError) as exc:
        raise SupabaseUnavailableError("Could not reach Supabase Auth") from exc
