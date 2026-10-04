type SupabaseUser = {
  id: string;
  email?: string;
};

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: SupabaseUser;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: SupabaseUser;
  msg?: string;
  message?: string;
  error_description?: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

const sessionStorageKey = "community-bridge-supabase-session";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the project’s .env.local file, then restart the app.",
    );
  }
  return { url, key };
}

function readSession(): SupabaseSession | null {
  try {
    const raw = window.localStorage.getItem(sessionStorageKey);
    if (!raw) return null;
    const session = JSON.parse(raw) as SupabaseSession;
    return session.access_token && session.refresh_token ? session : null;
  } catch {
    return null;
  }
}

function saveSession(response: AuthResponse): SupabaseSession {
  if (!response.access_token || !response.refresh_token || !response.user) {
    throw new Error("Supabase did not return a complete sign-in session.");
  }
  const session: SupabaseSession = {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_in: response.expires_in,
    expires_at: response.expires_at ?? (response.expires_in ? Math.floor(Date.now() / 1000) + response.expires_in : undefined),
    token_type: response.token_type,
    user: response.user,
  };
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
  return session;
}

async function authRequest<T>(path: string, body?: Record<string, string>, accessToken?: string): Promise<T> {
  const { url, key } = getConfig();
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Could not reach Supabase. Check your project URL and internet connection.");
  }

  const data = (await response.json().catch(() => ({}))) as AuthResponse;
  if (!response.ok) {
    throw new Error(data.message || data.msg || data.error_description || "Supabase authentication failed.");
  }
  return data as T;
}

function publicUser(session: SupabaseSession): AuthUser {
  return { id: session.user.id, email: session.user.email ?? "" };
}

export async function signIn(email: string, password: string) {
  const response = await authRequest<AuthResponse>("token?grant_type=password", { email, password });
  const session = saveSession(response);
  return { ...session, user: publicUser(session) };
}

export async function signUp(email: string, password: string) {
  // With confirmation enabled, the Auth HTTP API returns the user directly.
  const response = await authRequest<AuthResponse & Partial<SupabaseUser>>("signup", { email, password });
  const saved = response.access_token ? saveSession(response) : null;
  const session = saved ? { ...saved, user: publicUser(saved) } : null;
  const user = response.user ?? (response.id ? { id: response.id, email: response.email } : null);
  return { user: user ? { id: user.id, email: user.email ?? email } : null, session };
}

async function refreshSession(session: SupabaseSession): Promise<SupabaseSession | null> {
  try {
    const response = await authRequest<AuthResponse>("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
    return saveSession(response);
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = readSession();
  if (!session) return null;
  const expiresAt = session.expires_at ?? 0;
  const activeSession = expiresAt && expiresAt * 1000 < Date.now() + 30_000
    ? await refreshSession(session)
    : session;
  if (!activeSession) return null;

  const { url, key } = getConfig();
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${activeSession.access_token}` },
    });
  } catch {
    return publicUser(activeSession);
  }
  if (response.status === 401) {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
  if (!response.ok) return publicUser(activeSession);
  const user = (await response.json()) as SupabaseUser;
  return { id: user.id, email: user.email ?? activeSession.user.email ?? "" };
}

export async function signOut() {
  const session = readSession();
  if (!session) return;
  try {
    await authRequest<void>("logout", {}, session.access_token);
  } finally {
    window.localStorage.removeItem(sessionStorageKey);
  }
}
