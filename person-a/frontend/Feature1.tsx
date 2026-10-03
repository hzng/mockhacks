"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import "./Feature1.css";

type RequestIconName = "website" | "design" | "spreadsheet" | "event" | "daily" | "social" | "research" | "other" | "details";

function RequestIcon({ name }: { name: RequestIconName }) {
  let drawing: ReactNode;

  switch (name) {
    case "website":
      drawing = <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h10M7 16h7" /></>;
      break;
    case "design":
      drawing = <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 1.6 1.6 0 0 1 1.2-2.7H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z" /><path d="M7.5 11h.01M10 7.5h.01M15 7.5h.01" /></>;
      break;
    case "spreadsheet":
      drawing = <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16M10 9v12M15 9v12" /></>;
      break;
    case "event":
      drawing = <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h7" /></>;
      break;
    case "daily":
      drawing = <><path d="m4 7 1.5 1.5L8 5.5M11 7h9M4 14l1.5 1.5L8 12.5M11 14h9M4 21h16" /><path d="M4 3h16" /></>;
      break;
    case "social":
      drawing = <><path d="m4 11 15-6v14l-15-6H3v-2h1ZM7 14l2 6h4l-2.2-4.8M19 9a4 4 0 0 1 0 6" /></>;
      break;
    case "research":
      drawing = <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5M8 10h5M10.5 7.5v5" /></>;
      break;
    case "other":
      drawing = <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>;
      break;
    case "details":
      drawing = <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6M8 10h8M8 14h8M8 18h5" /><path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></>;
      break;
  }

  return (
    <svg
      aria-hidden="true"
      className="request-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {drawing}
    </svg>
  );
}

const requestTypes: { id: string; icon: RequestIconName; title: string }[] = [
  { id: "website", icon: "website", title: "Website or computer help" },
  { id: "design", icon: "design", title: "Flyer, design, or translation" },
  { id: "spreadsheet", icon: "spreadsheet", title: "Spreadsheet or data" },
  { id: "event", icon: "event", title: "Help with an event" },
  { id: "daily", icon: "daily", title: "Everyday tasks or errands" },
  { id: "social", icon: "social", title: "Social media" },
  { id: "research", icon: "research", title: "Research or planning" },
  { id: "other", icon: "other", title: "Something else" },
];

export default function Feature1() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleType(typeId: string) {
    setSelectedTypes((current) =>
      current.includes(typeId)
        ? current.filter((selected) => selected !== typeId)
        : [...current, typeId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const selectedTitles = requestTypes
    .filter((type) => selectedTypes.includes(type.id))
    .map((type) => type.title);

  return (
    <main className="request-page">
      <header className="request-hero">
        <p className="request-eyebrow">COMMUNITY BRIDGE · LOCAL PROJECTS</p>
        <h1>Request assistance</h1>
        <p className="request-intro">
          Tell us what you or your community needs help with. A local college
          student may be able to help.
        </p>
      </header>

      <div className="request-content">
          <section className="request-form-card" aria-labelledby="request-form-heading">
            <div className="request-section-heading">
              <p className="request-step"><RequestIcon name="details" /> REQUEST DETAILS</p>
              <h2 id="request-form-heading">Tell us what you need</h2>
              <p>Please share a few details so students know how to help.</p>
            </div>

            <form className="request-form" onSubmit={handleSubmit}>
              <div className="request-field">
                <label htmlFor="requester-name">Who is requesting help?</label>
                <input id="requester-name" name="requesterName" type="text" placeholder="Your name, group, or organization" required />
              </div>

              <div className="request-field">
                <label htmlFor="request-title">Give your request a short name</label>
                <input
                  id="request-title"
                  name="title"
                  type="text"
                  placeholder="For example: Update my shop’s website"
                  required
                />
              </div>

              <div className="request-field">
                <label htmlFor="request-description">Please describe what you need</label>
                <textarea
                  id="request-description"
                  name="description"
                  rows={6}
                  placeholder="What needs to be done? What would a good result look like?"
                  required
                />
              </div>

              <div className="request-form-row">
                <div className="request-field">
                  <label htmlFor="skills">Skills that may help <span>(optional)</span></label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    placeholder="Writing, web design..."
                  />
                </div>

                <div className="request-field">
                  <label htmlFor="reward">Anything you can offer the student? <span>(optional)</span></label>
                  <input
                    id="reward"
                    name="reward"
                    type="text"
                    placeholder="For example: a free drink or a portfolio reference"
                  />
                </div>
              </div>

              <button className="request-submit" type="submit" disabled={selectedTypes.length === 0}>
                Submit request <span aria-hidden="true">→</span>
              </button>
              <p className="request-form-note">You do not need to pay. You can offer a thank-you if you like, such as a local perk.</p>
            </form>
          </section>

          <aside className="request-ideas-card" aria-labelledby="request-ideas-heading">
            <p className="request-step">CHOOSE A REQUEST TYPE</p>
            <h2 id="request-ideas-heading">What kind of help do you need?</h2>
            <p className="request-ideas-intro">Select one or more options. Choose “Something else” if you do not see what you need.</p>
            <div className="request-type-list" role="group" aria-label="Request types">
              {requestTypes.map((type) => {
                const selected = selectedTypes.includes(type.id);

                return (
                  <button
                    className={`request-type${selected ? " is-selected" : ""}`}
                    key={type.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleType(type.id)}
                  >
                    <span className="request-type-icon"><RequestIcon name={type.icon} /></span>
                    <span className="request-type-title">{type.title}</span>
                    <span className="request-type-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
            <p className="request-selection-count" id="request-selection-count" aria-live="polite">
              {selectedTypes.length === 0
                ? "Please select at least one option."
                : `${selectedTypes.length} ${selectedTypes.length === 1 ? "option" : "options"} selected`}
            </p>
          </aside>
      </div>

      {submitted && (
        <div className="request-success-overlay">
          <section
            className="request-success-panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="request-success-heading"
            aria-describedby="request-success-description"
          >
            <div className="request-success-check" aria-hidden="true">✓</div>
            <p className="request-success-label">REQUEST RECEIVED</p>
            <h2 id="request-success-heading">Your request has been submitted.</h2>
            <p id="request-success-description">Thank you for reaching out. Students can now see what you need help with.</p>
            {selectedTitles.length > 0 && (
              <ul className="request-confirmation-types">
                {selectedTitles.map((title) => <li key={title}>{title}</li>)}
              </ul>
            )}
            <button
              className="request-success-button"
              type="button"
              autoFocus
              onClick={() => setSubmitted(false)}
            >
              Back to request page
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
