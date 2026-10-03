"use client";

// TEMPORARY stand-in for auth/ until the integration owner adds the two demo accounts.
// When auth/ is ready: make useCurrentUser() and findUser() use auth's accounts, then delete DemoUserSwitcher.
// The choice is kept per browser tab (sessionStorage), so one tab can be the owner and another the student.
import { useSyncExternalStore } from "react";
import { DEMO_USERS } from "./mockData";
import type { User } from "./tasks";
import styles from "./task.module.css";

const KEY = "person-d-demo-user";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readUserId(): string {
  try {
    return window.sessionStorage.getItem(KEY) ?? DEMO_USERS[0].id;
  } catch {
    return DEMO_USERS[0].id;
  }
}

function switchTo(id: string) {
  try {
    window.sessionStorage.setItem(KEY, id);
  } catch {
    // Storage blocked: the switch will not stick, but the page keeps working as the default user.
  }
  listeners.forEach((listener) => listener());
}

export function findUser(id: string): User | undefined {
  return DEMO_USERS.find((user) => user.id === id);
}

// Returns null during the server render, before the browser can tell us who is signed in.
export function useCurrentUser(): User | null {
  const id = useSyncExternalStore(subscribe, readUserId, () => null);
  if (id === null) return null;
  return findUser(id) ?? DEMO_USERS[0];
}

export function DemoUserSwitcher({ current }: { current: User }) {
  return (
    <div className={styles.switcher}>
      <span className="muted">Demo account (temporary):</span>
      {DEMO_USERS.map((user) => (
        <button
          aria-pressed={user.id === current.id}
          className={user.id === current.id ? undefined : "secondary"}
          key={user.id}
          onClick={() => switchTo(user.id)}
          type="button"
        >
          {user.name} · {user.role === "owner" ? "Business" : "Student"}
        </button>
      ))}
    </div>
  );
}
