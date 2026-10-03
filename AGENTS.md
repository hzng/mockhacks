# Project instructions

- Keep browser code in `frontend/` and API/database logic in `backend/`.
- The browser should call the backend through `/api`; keep database credentials and privileged keys server-side.
- Add page metadata to `frontend/src/config/pages.ts`. Mark utility pages with `developerTool: true` so the app shell can hide or show them.
- Keep product-specific schema out of the starter. Add Supabase migrations only after the product's data model is known, and include appropriate Row Level Security policies.
- Use the shared components and tokens in `frontend/src/components/ui/` and `frontend/src/styles/` for the component showcase.
- Do not commit `.env` files, API keys, database passwords, or tokens.
