"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createSubmission,
  isValidUrl,
  loadSubmissions,
  resubmitSubmission,
  reviewSubmission,
  saveSubmissions,
  type Submission,
  type SubmissionStatus,
} from "@/person-c/backend/feature3";

type Role = "volunteer" | "poster";

const PROFILE_KEY = "hackathon-demo-profile";
const ROLE_KEY = "person-c-role";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: "Pending review",
  approved: "Verified",
  rejected: "Needs rework",
};

// Matches the form field styling in app/globals.css (which only styles
// textarea and login-form inputs), so text inputs look consistent.
const inputStyle = {
  border: "1px solid #cbd4e2",
  borderRadius: "8px",
  display: "block",
  font: "inherit",
  margin: "0.5rem 0 1rem",
  padding: "0.75rem",
  width: "100%",
} as const;

export default function Feature3() {
  const [role, setRole] = useState<Role>("volunteer");
  const [displayName, setDisplayName] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState("Loading submissions…");
  const [busy, setBusy] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const savedRole = window.localStorage.getItem(ROLE_KEY);
    if (savedRole === "volunteer" || savedRole === "poster") {
      setRole(savedRole);
    }
    setDisplayName(window.localStorage.getItem(PROFILE_KEY) ?? "");
    loadSubmissions()
      .then((list) => {
        setSubmissions(list);
        setMessage(
          list.length > 0
            ? "Loaded from local backend storage."
            : "No submissions yet. Submit the first one below.",
        );
      })
      .catch(() => {
        setMessage(
          "Could not reach the backend. Start both servers with ./start.sh.",
        );
      });
  }, []);

  function switchRole(next: Role) {
    setRole(next);
    window.localStorage.setItem(ROLE_KEY, next);
  }

  async function persist(next: Submission[]) {
    setSubmissions(next);
    await saveSubmissions(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim() || !link.trim()) {
      setMessage("Task title and deliverable link are required.");
      return;
    }
    if (!isValidUrl(link)) {
      setMessage("Please enter a valid http(s) link to your work.");
      return;
    }
    setBusy(true);
    try {
      const volunteerName = displayName.trim();
      if (volunteerName) {
        window.localStorage.setItem(PROFILE_KEY, volunteerName);
      }
      await persist([
        ...submissions,
        createSubmission({
          taskTitle,
          volunteerName: displayName,
          link,
          note,
        }),
      ]);
      setTaskTitle("");
      setLink("");
      setNote("");
      setMessage("Submitted for review. Switch to the poster view to approve it.");
    } catch {
      setMessage("Submit failed. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReview(id: string, approved: boolean) {
    setBusy(true);
    try {
      await persist(
        submissions.map((item) =>
          item.id === id
            ? reviewSubmission(item, approved, reviewerNotes[id] ?? "")
            : item,
        ),
      );
      setReviewerNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setMessage(
        approved
          ? "Approved. It now shows as a verified record below."
          : "Sent back for rework.",
      );
    } catch {
      setMessage("Review failed. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResubmit(id: string) {
    setBusy(true);
    try {
      await persist(
        submissions.map((item) =>
          item.id === id ? resubmitSubmission(item) : item,
        ),
      );
      setMessage("Resubmitted. It is back in the review queue.");
    } catch {
      setMessage("Resubmit failed. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  const pending = submissions.filter((item) => item.status === "pending");
  const verified = submissions.filter((item) => item.status === "approved");
  const rework = submissions.filter((item) => item.status === "rejected");

  return (
    <main>
      <div className="page-heading">
        <h1>Submission Review</h1>
        <p className="muted">
          Volunteers submit finished work, posters approve it, and approved work
          becomes a verified completion record.
        </p>
      </div>

      <div className="button-row" role="group" aria-label="Choose your role">
        <button
          className={role === "volunteer" ? undefined : "secondary"}
          onClick={() => switchRole("volunteer")}
          type="button"
        >
          I&apos;m a volunteer
        </button>
        <button
          className={role === "poster" ? undefined : "secondary"}
          onClick={() => switchRole("poster")}
          type="button"
        >
          I&apos;m a poster
        </button>
      </div>

      <p className="muted">
        {role === "volunteer"
          ? "Fill in the form to submit your finished work for review."
          : "Review what volunteers submitted. Approve good work or send it back with a note."}
      </p>

      <p aria-live="polite" className="status-message">
        {message}
      </p>

      {role === "volunteer" && (
        <section className="editor" aria-label="Submit your work">
          <form onSubmit={handleSubmit}>
            <label htmlFor="person-c-name">Your name</label>
            <input
              id="person-c-name"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Alex (or set it on the login page)"
              style={inputStyle}
              value={displayName}
            />
            <label htmlFor="person-c-task">Task title</label>
            <input
              id="person-c-task"
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="e.g. Translate the bakery flyer to Spanish"
              required
              style={inputStyle}
              value={taskTitle}
            />
            <label htmlFor="person-c-link">Deliverable link</label>
            <input
              id="person-c-link"
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://…"
              required
              style={inputStyle}
              value={link}
            />
            <label htmlFor="person-c-note">What did you do?</label>
            <textarea
              id="person-c-note"
              onChange={(event) => setNote(event.target.value)}
              placeholder="A short note for the poster"
              value={note}
            />
            <div className="button-row">
              <button disabled={busy} type="submit">
                Submit for review
              </button>
            </div>
          </form>
        </section>
      )}

      {role === "poster" && (
        <section aria-label="Review queue">
          <h2>Pending review ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="muted">Nothing waiting for review right now.</p>
          ) : (
            <div className="card-grid">
              {pending.map((item) => (
                <article className="card" key={item.id}>
                  <h3>{item.taskTitle}</h3>
                  <p className="muted">
                    by {item.volunteerName} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <a href={item.link} rel="noreferrer" target="_blank">
                      Open deliverable
                    </a>
                  </p>
                  {item.note && <p>{item.note}</p>}
                  <label htmlFor={`review-${item.id}`}>
                    Reviewer note (optional)
                  </label>
                  <textarea
                    id={`review-${item.id}`}
                    onChange={(event) =>
                      setReviewerNotes((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Great work! / Please fix…"
                    rows={2}
                    style={{ ...inputStyle, minHeight: "3rem" }}
                    value={reviewerNotes[item.id] ?? ""}
                  />
                  <div className="button-row">
                    <button
                      disabled={busy}
                      onClick={() => handleReview(item.id, true)}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => handleReview(item.id, false)}
                      type="button"
                    >
                      Send back
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <section aria-label="Completion records">
        <h2>Verified records ({verified.length})</h2>
        {verified.length === 0 ? (
          <p className="muted">
            Approved work will appear here as verified records.
          </p>
        ) : (
          <div className="card-grid">
            {verified.map((item) => (
              <article className="card" key={item.id}>
                <h3>{item.taskTitle}</h3>
                <p className="muted">
                  {STATUS_LABEL[item.status]} · by {item.volunteerName}
                </p>
                <p>
                  <a href={item.link} rel="noreferrer" target="_blank">
                    Open deliverable
                  </a>
                </p>
                {item.reviewerNote && <p>Poster note: {item.reviewerNote}</p>}
              </article>
            ))}
          </div>
        )}
        {rework.length > 0 && (
          <>
            <h2>Sent back for rework ({rework.length})</h2>
            <div className="card-grid">
              {rework.map((item) => (
                <article className="card" key={item.id}>
                  <h3>{item.taskTitle}</h3>
                  <p className="muted">by {item.volunteerName}</p>
                  {item.reviewerNote && <p>Poster note: {item.reviewerNote}</p>}
                  <div className="button-row">
                    <button
                      disabled={busy}
                      onClick={() => handleResubmit(item.id)}
                      type="button"
                    >
                      Revise &amp; resubmit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
