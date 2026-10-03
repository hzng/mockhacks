"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEMO_USERS,
  findDemoUser,
  loadPostedBounties,
  loadVerifiedRecords,
  readDemoUserId,
  writeDemoUserId,
  type DemoUser,
  type PostedBounty,
  type VerifiedEntry,
} from "@/person-c/backend/feature3";

type ProfileData =
  | { kind: "student"; records: VerifiedEntry[] }
  | { kind: "owner"; bounties: PostedBounty[] };

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function Feature3() {
  const [user, setUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [data, setData] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState("Loading profile…");

  const load = useCallback(async (current: DemoUser) => {
    setMessage("Loading profile…");
    try {
      if (current.role === "student") {
        const records = await loadVerifiedRecords(current.id);
        setData({ kind: "student", records });
        setMessage(
          records.length > 0
            ? `${records.length} verified record${records.length === 1 ? "" : "s"}.`
            : "No verified records yet.",
        );
      } else {
        const bounties = await loadPostedBounties(current.id);
        setData({ kind: "owner", bounties });
        setMessage(
          bounties.length > 0
            ? `${bounties.length} posted ${bounties.length === 1 ? "bounty" : "bounties"}.`
            : "No posted bounties yet.",
        );
      }
    } catch (error) {
      setData(null);
      setMessage(
        error instanceof Error ? error.message : "Could not load the profile.",
      );
    }
  }, []);

  useEffect(() => {
    const current = findDemoUser(readDemoUserId());
    setUser(current);
    void load(current);
  }, [load]);

  function switchUser(id: string) {
    const current = findDemoUser(id);
    writeDemoUserId(current.id);
    setUser(current);
    void load(current);
  }

  return (
    <main>
      <div className="page-heading">
        <h1>{user.name}</h1>
        <p className="muted">
          {user.role === "owner" ? "Business" : "Student"} · {user.org}
        </p>
      </div>

      <div className="button-row" role="group" aria-label="Switch demo account">
        {DEMO_USERS.map((candidate) => (
          <button
            className={candidate.id === user.id ? undefined : "secondary"}
            key={candidate.id}
            onClick={() => switchUser(candidate.id)}
            type="button"
          >
            {candidate.name} · {candidate.role === "owner" ? "Business" : "Student"}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="status-message">
        {message}
      </p>

      {data?.kind === "student" && (
        <section aria-label="Verified work records">
          <h2>Verified work records ({data.records.length})</h2>
          {data.records.length === 0 ? (
            <p className="muted">
              No verified records yet. Claim a bounty and get it approved on
              Page D — it will show up here as a verified portfolio entry.
            </p>
          ) : (
            <div className="card-grid">
              {data.records.map((record) => (
                <article className="card" key={record.bountyId}>
                  <h3>{record.title}</h3>
                  <p className="muted">
                    {record.business} · approved by {record.approvedBy}
                  </p>
                  <p className="muted">{formatTime(record.approvedAt)}</p>
                  <p>
                    <a href={record.link} rel="noreferrer" target="_blank">
                      Open deliverable
                    </a>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {data?.kind === "owner" && (
        <section aria-label="Posted bounties">
          <h2>Posted bounties ({data.bounties.length})</h2>
          {data.bounties.length === 0 ? (
            <p className="muted">
              No posted bounties yet. Bounties you post will be listed here.
            </p>
          ) : (
            <div className="card-grid">
              {data.bounties.map((bounty) => (
                <article className="card" key={bounty.id}>
                  <h3>{bounty.title}</h3>
                  <p className="muted">{bounty.business}</p>
                  <p className="muted">
                    {bounty.claimedBy
                      ? "Claimed — work in progress"
                      : "Open — waiting for a student"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
