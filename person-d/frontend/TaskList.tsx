"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findUser } from "./currentUser";
import { loadMyTasks } from "./taskStore";
import { STATUS_LABELS, type Bounty, type Task, type User } from "./tasks";
import styles from "./task.module.css";

type Row = { bounty: Bounty; task: Task };
type Loaded = { rows: Row[] } | { error: string };

function isMyTurn(user: User, task: Task): boolean {
  if (user.role === "owner") return task.status === "submitted";
  return task.status === "claimed" || task.status === "changes_requested";
}

export default function TaskList({ user }: { user: User }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let active = true;
    loadMyTasks(user)
      .then((rows) => {
        if (active) setLoaded({ rows });
      })
      .catch((error: unknown) => {
        if (active) setLoaded({ error: error instanceof Error ? error.message : "Could not load tasks." });
      });
    return () => {
      active = false;
    };
  }, [user]);

  const isOwner = user.role === "owner";
  const rows = loaded && "rows" in loaded
    ? [...loaded.rows].sort((a, b) => Number(isMyTurn(user, b.task)) - Number(isMyTurn(user, a.task)))
    : [];

  return (
    <>
      <div className="page-heading">
        <h1>My tasks</h1>
        <p className="muted">
          {isOwner
            ? "Bounties you posted that a student has claimed. Review their work and keep in touch here."
            : "Bounties you claimed. Ask questions, submit your work, and get it approved here."}
        </p>
      </div>

      {loaded === null && <p className="muted">Loading tasks…</p>}
      {loaded && "error" in loaded && <p className={styles.error}>{loaded.error}</p>}
      {loaded && "rows" in loaded && rows.length === 0 && (
        <p className="muted">
          {isOwner ? "No student has claimed one of your bounties yet." : "You haven't claimed a bounty yet. Find one on the board."}
        </p>
      )}

      <ul className={styles.taskList}>
        {rows.map(({ bounty, task }) => {
          const other = isOwner ? findUser(bounty.claimedBy ?? "")?.name ?? bounty.claimedBy : bounty.business;
          const last = task.thread.at(-1);
          return (
            <li key={bounty.id}>
              <Link className={`card ${styles.taskRow}`} href={`/feature-4?bounty=${encodeURIComponent(bounty.id)}`}>
                <div className={styles.rowTop}>
                  <strong>{bounty.title}</strong>
                  <span className={`${styles.badge} ${styles[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                </div>
                <span className="muted">
                  {isOwner ? "Student" : "Business"}: {other} · {task.thread.length} message{task.thread.length === 1 ? "" : "s"}
                  {last && ` · last update ${new Date(last.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
                </span>
                {isMyTurn(user, task) && <span className={styles.yourTurn}>{isOwner ? "Needs your review" : "Your turn"}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
