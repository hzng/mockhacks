# Hackathon Collaboration Starter

The web app runs from the repository root. On Windows, double-click `start.bat` or run `start.bat` in a terminal. On Git Bash or WSL, run `bash ./start.sh`. Both launchers prepare dependencies and start the Next.js frontend and FastAPI backend. Open <http://localhost:3000> in your browser; the Windows launcher opens it automatically. On Windows, close the two server windows to stop the app; in Bash, press Ctrl+C.

## Project Layout

```text
app/                         # Stable Next.js routes and bridge pages
├── layout.tsx
├── page.tsx                  # Main page
├── feature-1/page.tsx        # Person A workspace
├── feature-2/page.tsx        # Person B workspace
├── feature-3/page.tsx        # Person C workspace
├── feature-4/page.tsx        # Person D workspace
└── login/page.tsx            # Local demo profile
main-page/
├── frontend/MainPage.tsx
└── frontend/LocalFeatureEditor.tsx  # Shared local-storage editor
person-a/
├── frontend/Feature1.tsx
└── backend/feature1.ts
person-b/
├── frontend/Feature2.tsx
└── backend/feature2.ts
person-c/
├── frontend/Feature3.tsx
└── backend/feature3.ts
person-d/
├── frontend/Feature4.tsx
└── backend/feature4.ts
auth/
├── frontend/Login.tsx
└── backend/auth.ts
backend/                      # Shared FastAPI API and local JSON storage
└── data/store.json           # Created at runtime; ignored by Git
next.config.ts                # Forwards frontend /api requests to FastAPI
start.bat                     # Windows launcher for both servers
start.sh                      # Git Bash/WSL launcher for both servers
.env.local                    # Local-only settings; ignored by Git
.env.example                  # Shared variable names; no secret values
package.json
package-lock.json             # Created by npm install on first launch
tsconfig.json
.gitignore
```

Each `app/**/page.tsx` is a small route bridge. The main page reads backend health and storage status. Each feature page can save and clear its own notes through `/api/storage/{key}`; the Next.js `/api` rewrite forwards those requests to FastAPI. The profile page stores a display name in this browser's `localStorage` and is a demo only, not secure authentication.

## Data Storage

There is no Supabase dependency. Browser-only preferences or data use browser `localStorage`. Shared local development data is stored by FastAPI as JSON in `backend/data/store.json`. The file is created when first written and ignored by Git. Do not put secrets in browser storage or commit runtime data.

## Team Ownership and Collaboration

| Owner | Work only in this folder |
| --- | --- |
| Person A | `person-a/**` |
| Person B | `person-b/**` |
| Person C | `person-c/**` |
| Person D | `person-d/**` |
| Integration owner | `app/**`, `auth/**`, shared `backend/**`, root configuration, and environment examples |

Work on a separate branch from `main`, such as `feature/person-a` or `feature/person-d`. Each collaborator should change only their assigned functionality folder. Do not edit another person's folder or shared files without coordinating with the integration owner.

Shared files include route bridges, auth, API/storage infrastructure, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `README.md`, `start.sh`, `.env.example`, and any local `.env` file. Changes to these files can affect every collaborator and create merge conflicts. Never commit `.env.local`, API keys, passwords, tokens, or local storage data.

When the actual features are decided, rename `person-a/`, `person-b/`, and `person-c/` to descriptive names and coordinate the corresponding route bridge updates with the integration owner.

