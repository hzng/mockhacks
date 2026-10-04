# PostgreSQL connection

The backend loads `DATABASE_URL` from `backend/.env` or the process environment.
The value is masked in settings representations and is never returned by the API.

1. Open your Supabase project's **Connect → Session pooler** dialog.
2. Copy the connection string into `DATABASE_URL` in `backend/.env` locally.
3. Replace the password placeholder with the database password, URL-encoding reserved
   characters. This is the database password, not the publishable API key.
4. Confirm the database name. Supabase's default is `postgres`; the supplied `postgr`
   appears truncated. The example uses `postgres`.
5. Restart the backend and request `http://localhost:8000/api/health/database`.
   A successful connection and `SELECT 1` return `{"status":"ok","service":"postgresql"}`.
   Missing settings or a failed connection return HTTP 503 with a sanitized message.

The supplied `pooler.supabase.com:5432` address connects using PostgreSQL through
Supabase's session pooler. The driver requires TLS and limits connection and query timeouts.

Application code can use `with connect_database() as connection:` from
`app.core.database` to execute parameterized queries and close connections automatically.
This setup adds database connectivity; existing storage endpoints still use the JSON store.
The login page continues to use Supabase Auth's URL and publishable key.

Reference: https://supabase.com/docs/guides/database/connecting-to-postgres
