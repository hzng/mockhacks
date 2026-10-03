"use client";

import { type FormEvent, useEffect, useState } from "react";

const profileKey = "hackathon-demo-profile";

export default function Login() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSavedName(window.localStorage.getItem(profileKey) ?? "");
    setReady(true);
  }, []);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) return;
    window.localStorage.setItem(profileKey, normalizedName);
    setSavedName(normalizedName);
    setName("");
    setMessage("Profile saved in this browser.");
  }

  function clearProfile() {
    window.localStorage.removeItem(profileKey);
    setSavedName("");
    setMessage("Local profile cleared.");
  }

  return (
    <main>
      <div className="page-heading">
        <h1>Local profile</h1>
        <p className="muted">A browser-only demo profile. This is not secure authentication.</p>
      </div>
      {ready && savedName ? (
        <section className="login-form">
          <p>Signed in on this browser as <strong>{savedName}</strong>.</p>
          <button className="secondary" onClick={clearProfile} type="button">Clear profile</button>
        </section>
      ) : (
        <form className="login-form" onSubmit={saveProfile}>
          <label htmlFor="profile-name">Display name</label>
          <input autoComplete="name" id="profile-name" onChange={(event) => setName(event.target.value)} required value={name} />
          <button disabled={!ready || !name.trim()} type="submit">Save local profile</button>
        </form>
      )}
      <p aria-live="polite" className="status-message">{message}</p>
    </main>
  );
}
