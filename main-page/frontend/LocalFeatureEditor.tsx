"use client";

import { useEffect, useState } from "react";

type StoredValue = { value: unknown };

export function LocalFeatureEditor({ storageKey }: { storageKey: string }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("Loading saved data…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/storage/${storageKey}`, { cache: "no-store" }).then(async (response) => {
      if (response.status === 404) {
        if (active) setMessage("Nothing saved yet.");
        return;
      }
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const result = (await response.json()) as StoredValue;
      if (active) {
        setText(typeof result.value === "string" ? result.value : JSON.stringify(result.value, null, 2) ?? "");
        setMessage("Loaded from local backend storage.");
      }
    }).catch(() => {
      if (active) setMessage("Could not reach the backend. Start both servers with ./start.sh.");
    });
    return () => { active = false; };
  }, [storageKey]);

  async function save() {
    setBusy(true);
    setMessage("Saving…");
    try {
      const response = await fetch(`/api/storage/${storageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(text),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      setMessage("Saved to backend/data/store.json.");
    } catch {
      setMessage("Save failed. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      const response = await fetch(`/api/storage/${storageKey}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error(`Backend returned ${response.status}`);
      setText("");
      setMessage("Saved data cleared.");
    } catch {
      setMessage("Clear failed. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="editor" aria-label="Feature notes">
      <label htmlFor={`${storageKey}-notes`}>Feature notes</label>
      <textarea
        id={`${storageKey}-notes`}
        onChange={(event) => setText(event.target.value)}
        placeholder="Use this space to try the connected local storage API."
        value={text}
      />
      <div className="button-row">
        <button disabled={busy} onClick={save} type="button">Save notes</button>
        <button className="secondary" disabled={busy} onClick={clear} type="button">Clear notes</button>
      </div>
      <p aria-live="polite" className="status-message">{message}</p>
    </section>
  );
}
