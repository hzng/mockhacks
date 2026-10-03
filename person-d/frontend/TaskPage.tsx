"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { findUser } from "./currentUser";
import { loadTaskView, performAction } from "./taskStore";
import {
  STATUS_LABELS,
  isSafeLink,
  latestSubmission,
  roleIn,
  whyNot,
  type Action,
  type Bounty,
  type Task,
  type ThreadEntry,
  type User,
} from "./tasks";
import styles from "./task.module.css";

const POLL_MS = 3000;

type Loaded = { bounty: Bounty | null; task: Task | null; error: string | null };
type Run = (action: Action) => Promise<boolean>;

function nameOf(id: string): string {
  return findUser(id)?.name ?? id;
}

function formatTime(at: string): string {
  return new Date(at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function TaskPage({ bountyId, user }: { bountyId: string; user: User }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Bumped around every write so a poll that started before the write can't show stale data.
  const writes = useRef(0);

  useEffect(() => {
    let active = true;
    async function refresh() {
      const startedAt = writes.current;
      try {
        const { bounty, task } = await loadTaskView(bountyId);
        if (active && startedAt === writes.current) setLoaded({ bounty, task, error: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load this task.";
        if (active) setLoaded((previous) => ({ bounty: previous?.bounty ?? null, task: previous?.task ?? null, error: message }));
      }
    }
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bountyId]);

  if (loaded === null) return <p className="muted">Loading task…</p>;
  const { bounty, task } = loaded;
  if (!bounty || !task) {
    return (
      <>
        <Link href="/feature-4">← My tasks</Link>
        <p className={styles.error}>{loaded.error ?? "This bounty does not exist."}</p>
      </>
    );
  }

  const role = roleIn(bounty, user);
  const open = role !== null && task.status !== "approved";

  const run: Run = async (action) => {
    const problem = whyNot(task, bounty, user, action);
    if (problem) {
      setActionError(problem);
      return false;
    }
    setBusy(true);
    setActionError(null);
    writes.current += 1;
    try {
      const next = await performAction(bounty, user, action);
      setLoaded({ bounty, task: next, error: null });
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Something went wrong. Try again.");
      return false;
    } finally {
      writes.current += 1;
      setBusy(false);
    }
  };

  return (
    <>
      <Link href="/feature-4">← My tasks</Link>
      <div className={`page-heading ${styles.heading}`}>
        <span className={`${styles.badge} ${styles[task.status]}`}>{STATUS_LABELS[task.status]}</span>
        <h1>{bounty.title}</h1>
        <p className="muted">
          Business: {nameOf(bounty.ownerId)} ({bounty.business}) · Student: {bounty.claimedBy ? nameOf(bounty.claimedBy) : "—"}
        </p>
      </div>

      {loaded.error && <p className={styles.error}>{loaded.error} Showing the last saved version.</p>}
      {role === null && (
        <p className={styles.notice}>You are viewing this as {user.name}, who is not part of this bounty, so it is read-only.</p>
      )}

      <Progress status={task.status} />

      <div className={styles.layout}>
        <div className={styles.column}>
          <section className="card">
            <h2>The bounty</h2>
            <p>{bounty.summary}</p>
            <ul className={styles.chips}>
              {bounty.skills.map((skill) => <li key={skill}>{skill}</li>)}
              <li>{bounty.hours} h</li>
              <li>{bounty.difficulty}</li>
            </ul>
            <p><strong>Reward:</strong> {bounty.reward}</p>
          </section>

          <Checklist bounty={bounty} busy={busy} role={role} run={run} task={task} />
        </div>

        <div className={styles.column}>
          <NextStep bounty={bounty} busy={busy} role={role} run={run} task={task} user={user} />
          {actionError && <p className={styles.error} role="alert">{actionError}</p>}
          <Thread bounty={bounty} task={task} user={user} />
          {open && <CommentBox busy={busy} run={run} />}
        </div>
      </div>
    </>
  );
}

function Progress({ status }: { status: Task["status"] }) {
  const reached = { claimed: 0, changes_requested: 1, submitted: 1, approved: 2 }[status];
  const steps = ["Claimed", status === "changes_requested" ? "Changes requested" : "Submitted", "Approved"];
  return (
    <ol className={styles.progress} aria-label="Task progress">
      {steps.map((step, index) => (
        <li
          aria-current={index === reached ? "step" : undefined}
          className={index < reached || status === "approved" ? styles.done : index === reached ? styles.current : undefined}
          key={step}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}

type PartProps = { bounty: Bounty; task: Task; role: User["role"] | null; busy: boolean; run: Run };

function Checklist({ bounty, task, role, busy, run }: PartProps) {
  const editable = role === "student" && (task.status === "claimed" || task.status === "changes_requested");
  const done = task.checked.filter(Boolean).length;
  return (
    <section className="card">
      <h2>Done when <span className="muted">({done}/{bounty.doneWhen.length})</span></h2>
      <ul className={styles.checklist}>
        {bounty.doneWhen.map((item, index) => (
          <li key={item}>
            <label>
              <input
                checked={task.checked[index] ?? false}
                disabled={!editable || busy}
                onChange={() => run({ kind: "toggle_check", index })}
                type="checkbox"
              />
              {item}
            </label>
          </li>
        ))}
      </ul>
      {!editable && role === "student" && <p className="muted">The checklist is locked while the business reviews your work.</p>}
      {role === "owner" && <p className="muted">The student ticks these off as they go.</p>}
    </section>
  );
}

function NextStep({ bounty, task, role, busy, run, user }: PartProps & { user: User }) {
  const student = bounty.claimedBy ? nameOf(bounty.claimedBy) : "the student";
  const owner = nameOf(bounty.ownerId);
  const lastRequest = task.thread.findLast((entry) => entry.kind === "request_changes");

  if (task.status === "approved") {
    const approval = task.thread.findLast((entry) => entry.kind === "approve");
    return (
      <section className={`card ${styles.approvedCard}`}>
        <h2>✅ Approved</h2>
        <p>
          {owner} approved this work{approval ? ` on ${formatTime(approval.at)}` : ""}.{" "}
          {role === "student"
            ? `It now shows on your profile as a verified entry from ${bounty.business}.`
            : `A verified entry from ${bounty.business} was added to ${student}'s profile.`}
        </p>
      </section>
    );
  }

  if (role === "student" && task.status !== "submitted") {
    return (
      <section className="card">
        <h2>{task.status === "changes_requested" ? "Resubmit your work" : "Submit your work"}</h2>
        {task.status === "changes_requested" && lastRequest && (
          <p className={styles.notice}><strong>{owner} asked for changes:</strong> {lastRequest.text}</p>
        )}
        <SubmitForm busy={busy} run={run} unchecked={task.checked.filter((checked) => !checked).length} />
      </section>
    );
  }

  if (role === "owner" && task.status === "submitted") {
    return <ReviewForm busy={busy} run={run} student={student} submission={latestSubmission(task)} />;
  }

  const waiting =
    role === "student" ? `Waiting for ${owner} to review your submission.`
    : role === "owner" && task.status === "changes_requested" ? `You asked for changes. Waiting for ${student} to resubmit.`
    : role === "owner" ? `${student} is working on it. You'll be able to review once they submit.`
    : `${STATUS_LABELS[task.status]}. Only ${owner} and ${student} can act on this task (you are ${user.name}).`;
  return <section className={`card ${styles.waiting}`}><p>{waiting}</p></section>;
}

function SubmitForm({ busy, run, unchecked }: { busy: boolean; run: Run; unchecked: number }) {
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run({ kind: "submit", link, text: note })) {
      setLink("");
      setNote("");
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="submit-link">Link to your work</label>
      <input id="submit-link" inputMode="url" onChange={(event) => setLink(event.target.value)} placeholder="https://…" value={link} />
      <label htmlFor="submit-note">Short note for the business</label>
      <textarea id="submit-note" onChange={(event) => setNote(event.target.value)} placeholder="What you did and how to check it" value={note} />
      {unchecked > 0 && (
        <p className="muted">{unchecked} checklist item{unchecked === 1 ? " is" : "s are"} not ticked yet. You can still submit.</p>
      )}
      <div className="button-row">
        <button disabled={busy} type="submit">Submit for review</button>
      </div>
    </form>
  );
}

function ReviewForm({ busy, run, student, submission }: { busy: boolean; run: Run; student: string; submission?: ThreadEntry }) {
  const [feedback, setFeedback] = useState("");

  async function review(kind: "approve" | "request_changes") {
    if (await run({ kind, text: feedback })) setFeedback("");
  }

  return (
    <section className="card">
      <h2>{`Review ${student}'s work`}</h2>
      {submission?.link && (
        <p>
          Submitted link: <SafeLink link={submission.link} />
        </p>
      )}
      {submission?.text && <p className={styles.quote}>{submission.text}</p>}
      <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="review-feedback">Feedback (required if you ask for changes)</label>
        <textarea
          id="review-feedback"
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="What looks good, or what still needs to change"
          value={feedback}
        />
        <div className="button-row">
          <button disabled={busy} onClick={() => review("approve")} type="button">Approve</button>
          <button className="secondary" disabled={busy} onClick={() => review("request_changes")} type="button">Request changes</button>
        </div>
      </form>
    </section>
  );
}

const KIND_LABELS: Record<ThreadEntry["kind"], string | null> = {
  comment: null,
  submit: "Submitted work",
  request_changes: "Requested changes",
  approve: "Approved",
};

function Thread({ bounty, task, user }: { bounty: Bounty; task: Task; user: User }) {
  return (
    <section className="card">
      <h2>Messages</h2>
      {task.thread.length === 0 && <p className="muted">No messages yet. Say hi and agree on the next step.</p>}
      <ol className={styles.thread}>
        {task.thread.map((entry) => (
          <li className={entry.by === user.id ? styles.mine : undefined} key={entry.id}>
            <div className={styles.entryHead}>
              <strong>{nameOf(entry.by)}</strong>
              <span className="muted">{entry.by === bounty.ownerId ? "Business" : "Student"} · {formatTime(entry.at)}</span>
              {KIND_LABELS[entry.kind] && <span className={`${styles.badge} ${styles[entry.kind]}`}>{KIND_LABELS[entry.kind]}</span>}
            </div>
            {entry.text && <p>{entry.text}</p>}
            {entry.link && <p><SafeLink link={entry.link} /></p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function CommentBox({ busy, run }: { busy: boolean; run: Run }) {
  const [text, setText] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run({ kind: "comment", text })) setText("");
  }

  return (
    <form className={`card ${styles.form}`} onSubmit={send}>
      <label htmlFor="comment-text">Send a message</label>
      <textarea id="comment-text" onChange={(event) => setText(event.target.value)} placeholder="Ask a question or share an update" value={text} />
      <div className="button-row">
        <button disabled={busy} type="submit">Send</button>
      </div>
    </form>
  );
}

function SafeLink({ link }: { link: string }) {
  if (!isSafeLink(link)) return <span>{link}</span>;
  return <a href={link} rel="noreferrer" target="_blank">{link}</a>;
}
