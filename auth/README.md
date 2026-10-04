# Supabase authentication setup

The login page at `/login` uses Supabase Auth for email and password sign-in and account creation.

1. Create or open a Supabase project.
2. In the project dashboard, open **Connect** and copy the Project URL and the publishable API key. A legacy `anon` key also works.
3. Add these values to the repository root `.env.local` file (keep the key out of source control):

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

4. Restart the Next.js dev server. If email confirmation is enabled in **Authentication → Providers → Email**, new users must confirm their address before signing in. Set the project’s Auth **Site URL** to the app origin (for local development, `http://localhost:3000`).

The browser client only uses the publishable key. Never put a secret or service-role key in either `NEXT_PUBLIC_` variable.

## Integration note

The current `/login` route renders this page. Showing it automatically at `/` requires the app integration owner to change `app/page.tsx` or add a route guard outside this folder. Those files were left untouched to honor the request to edit only `auth/`.
