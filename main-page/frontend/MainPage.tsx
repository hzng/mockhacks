"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Health = { status: string; storage: string };
type StorageSummary = { keys: string[]; count: number };

export default function MainPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [message, setMessage] = useState("Connecting to the local backend…");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/health", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("Health check failed");
        return response.json() as Promise<Health>;
      }),
      fetch("/api/storage", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("Storage summary failed");
        return response.json() as Promise<StorageSummary>;
      }),
    ]).then(([healthResult, summaryResult]) => {
      if (!active) return;
      setHealth(healthResult);
      setSummary(summaryResult);
      setMessage("Web app and local backend are connected.");
    }).catch(() => {
      if (active) setMessage("Backend is offline. Start the app with ./start.sh from the project root.");
    });
    return () => { active = false; };
  }, []);

  const features = [
    { href: "/feature-1", name: "Feature 1", owner: "Person A", key: "person-a-notes" },
    { href: "/feature-2", name: "Feature 2", owner: "Person B", key: "person-b-notes" },
    { href: "/feature-3", name: "Feature 3", owner: "Person C", key: "person-c-notes" },
    { href: "/feature-4", name: "Feature 4", owner: "Person D", key: "person-d-notes" },
  ];

  return (
    <main>
      <div className="page-heading">
        <h1>Hackathon workspace</h1>
        <p className="muted">Each feature page is connected to persistent local backend storage.</p>
        <p aria-live="polite" className="status-message">{message}</p>
        {health && <p className="status-message">API: {health.status} · Storage: {health.storage}</p>}
      </div>
      <section className="card-grid" aria-label="Feature workspaces">
        {features.map((feature) => (
          <article className="card" key={feature.href}>
            <h2>{feature.name}</h2>
            <p className="muted">Owned by {feature.owner}</p>
            <p>{summary?.keys.includes(feature.key) ? "Saved notes are available." : "No saved notes yet."}</p>
            <Link href={feature.href}>Open workspace</Link>
          </article>
        ))}
      </section>
      <p className="muted">Saved feature records: {summary?.count ?? "—"}</p>
      <p><Link href="/login">Set a local demo profile</Link></p>
    </main>
  );
}
