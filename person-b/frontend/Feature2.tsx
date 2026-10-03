"use client";

import { useState } from "react";
import { BountyBoard } from "./BountyBoard";
import { PostProblem } from "./PostProblem";
import styles from "./bounties.module.css";

type Tab = "post" | "board";

export default function Feature2() {
  const [tab, setTab] = useState<Tab>("post");
  const [justPostedId, setJustPostedId] = useState<string | null>(null);

  return (
    <main className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Community Bridge</h1>
          <p>Local problems, solved by De Anza students.</p>
        </div>
        <nav className={styles.tabs} aria-label="Bounty pages">
          <button aria-pressed={tab === "post"} className={tab === "post" ? styles.tabActive : styles.tab} onClick={() => setTab("post")} type="button">
            Post a problem
          </button>
          <button aria-pressed={tab === "board"} className={tab === "board" ? styles.tabActive : styles.tab} onClick={() => setTab("board")} type="button">
            Bounty board
          </button>
        </nav>
      </div>
      {tab === "post" ? (
        <PostProblem onPosted={(bounty) => { setJustPostedId(bounty.id); setTab("board"); }} />
      ) : (
        <BountyBoard highlightId={justPostedId} />
      )}
    </main>
  );
}
