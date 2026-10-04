"use client";

import { type FormEvent, useEffect, useState } from "react";
import { getCurrentUser, signIn, signOut, signUp, type AuthUser } from "./supabase";
import styles from "./Login.module.css";

type Mode = "sign-in" | "sign-up";

export default function Login() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not restore your session.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "sign-in") {
        const session = await signIn(email.trim(), password);
        setUser(session.user);
        setPassword("");
        setMessage("You’re signed in. Taking you to Community Bridge…");
        window.setTimeout(() => window.location.assign("/"), 700);
      } else {
        const result = await signUp(email.trim(), password);
        if (result.user && !result.session) {
          setMessage("Check your email for a confirmation link, then come back here to sign in.");
          setMode("sign-in");
          setPassword("");
        } else if (result.session) {
          setUser(result.session.user);
          setPassword("");
          setMessage("Your account is ready. Taking you to Community Bridge…");
          window.setTimeout(() => window.location.assign("/"), 700);
        } else {
          setMessage("Your account request was received. Check your email for next steps.");
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    setError("");
    try {
      await signOut();
      setUser(null);
      setMessage("You’ve signed out.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <section aria-labelledby="auth-title" className={styles.card}>
        <div className={styles.brandMark} aria-hidden="true">CB</div>
        <p className={styles.eyebrow}>Community Bridge</p>
        {ready && user ? (
          <div className={styles.signedIn}>
            <h1 id="auth-title">Welcome back.</h1>
            <p className={styles.description}>You’re signed in as <strong>{user.email}</strong>.</p>
            <a className={styles.primaryButton} href="/">Go to the community board <span aria-hidden="true">→</span></a>
            <button className={styles.textButton} disabled={busy} onClick={handleSignOut} type="button">
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <>
            <h1 id="auth-title">{mode === "sign-in" ? "Find your people." : "Join the community."}</h1>
            <p className={styles.description}>
              {mode === "sign-in"
                ? "Sign in to connect local needs with student talent."
                : "Create an account to start building something together."}
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor="email">Email address</label>
              <input
                autoComplete="email"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />

              <label htmlFor="password">Password</label>
              <input
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                id="password"
                minLength={6}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
                type="password"
                value={password}
              />

              <button className={styles.primaryButton} disabled={!ready || busy} type="submit">
                {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
                {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className={styles.switchMode}>
              {mode === "sign-in" ? "New to Community Bridge?" : "Already have an account?"}{" "}
              <button
                className={styles.textButton}
                onClick={() => {
                  setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                {mode === "sign-in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}

        <div aria-live="polite" className={error ? styles.error : styles.notice} role={error ? "alert" : "status"}>
          {error || message}
        </div>
        <p className={styles.footer}>Local projects. Real people. Stronger communities.</p>
      </section>
      <aside aria-hidden="true" className={styles.storyPanel}>
        <div className={`${styles.orbit} ${styles.orbitOne}`} />
        <div className={`${styles.orbit} ${styles.orbitTwo}`} />
        <div className={styles.storyContent}>
          <span className={styles.storyTag}>A bridge between campus and community</span>
          <p>Small local problems can become big opportunities.</p>
          <div className={styles.storyRule} />
          <span className={styles.storyCaption}>Meet a need. Make a difference.</span>
        </div>
        <span className={styles.panelIndex}>01 / COMMUNITY</span>
      </aside>
    </main>
  );
}
