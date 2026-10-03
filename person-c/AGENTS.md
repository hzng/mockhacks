# Project instructions

- Keep each Next.js route file in `app/` small and stable. It should render the component for that route.
- Work only in the functionality folder assigned to you. Person A owns `person-a/**`, Person B owns `person-b/**`, Person C owns `person-c/**`, and Person D owns `person-d/**`.
- Do not edit another person's folder or shared files unless the user explicitly assigns that work to you. Shared files include `app/**`, `auth/**`, `main-page/**`, shared `backend/**`, root configuration, `README.md`, and `.env.example`.
- If the requested work requires changes outside your assigned folder, finish the work that fits your folder and tell the user which shared file needs an integration-owner change. Do not make that shared change yourself unless explicitly assigned.
- Never create, read, print, or edit live environment files, including `.env`, `.env.local`, and `backend/.env`. Never ask the user to paste a secret into chat. If a required setting is missing, tell the user which file to edit and give the exact variable name and a safe, non-secret example value. The user must enter any secret locally.
- Keep browser-only state in browser `localStorage`; keep shared local development data in the backend's file store at `backend/data/store.json`.
- Do not add Supabase or another hosted database unless the user explicitly changes the storage plan.
- Never commit environment files, API keys, passwords, tokens, or runtime storage data.
