"use client";

import { useEffect, useRef } from "react";
import type { BountyCard } from "./bountyApi";
import styles from "./bounties.module.css";

const AVATAR_TONES = ["toneBlue", "toneGreen", "toneAmber", "toneRose", "toneViolet", "toneTeal"];
const MAX_TILE_SKILLS = 3;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join("");
}

function toneFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return styles[AVATAR_TONES[hash % AVATAR_TONES.length]];
}

export function timeAgo(iso?: string) {
  if (!iso) return "Draft";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span aria-hidden className={`${styles.avatar} ${large ? styles.avatarLarge : ""} ${toneFor(name)}`}>
      {initials(name)}
    </span>
  );
}

export function DifficultyPill({ difficulty }: { difficulty: BountyCard["difficulty"] }) {
  return <span className={`${styles.pill} ${styles[difficulty]}`}>{difficulty}</span>;
}

type TileProps = {
  bounty: BountyCard;
  createdAt?: string;
  highlight?: boolean;
  onOpen?: () => void;
};

/** Compact board card: just enough to decide whether to open it. */
export function BountyTile({ bounty, createdAt, highlight = false, onOpen }: TileProps) {
  const extraSkills = bounty.skills.length - MAX_TILE_SKILLS;

  return (
    <article
      className={`${styles.tile} ${highlight ? styles.tileHighlight : ""} ${onOpen ? styles.tileClickable : ""}`}
      onClick={onOpen}
    >
      {highlight && <span className={styles.newTag}>Just posted</span>}
      <header className={styles.tileHeader}>
        <Avatar name={bounty.business_name} />
        <div className={styles.tileBusiness}>
          <span className={styles.businessName}>{bounty.business_name}</span>
          <span className={styles.timeAgo}>{timeAgo(createdAt)}</span>
        </div>
      </header>

      <h2 className={styles.tileTitle}>{bounty.title || "Untitled bounty"}</h2>
      <p className={styles.tileSummary}>{bounty.summary}</p>

      <ul className={styles.chips}>
        {bounty.skills.slice(0, MAX_TILE_SKILLS).map((skill) => <li key={skill}>{skill}</li>)}
        {extraSkills > 0 && <li className={styles.chipMore}>+{extraSkills}</li>}
      </ul>

      <footer className={styles.tileFooter}>
        <DifficultyPill difficulty={bounty.difficulty} />
        <span className={styles.hours}>{bounty.estimated_hours || "?"} hrs</span>
        {onOpen && (
          <button
            className={styles.linkButton}
            onClick={(event) => { event.stopPropagation(); onOpen(); }}
            type="button"
          >
            View details →
          </button>
        )}
      </footer>
    </article>
  );
}

/** Full bounty details, shown in a modal when a tile is opened. */
export function BountyDetail({ bounty, createdAt, onClose }: { bounty: BountyCard; createdAt?: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        aria-labelledby="bounty-detail-title"
        aria-modal="true"
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="Close" className={styles.closeButton} onClick={onClose} ref={closeRef} type="button">×</button>

        <header className={styles.tileHeader}>
          <Avatar large name={bounty.business_name} />
          <div className={styles.tileBusiness}>
            <span className={styles.businessName}>{bounty.business_name}</span>
            <span className={styles.timeAgo}>{timeAgo(createdAt)}</span>
          </div>
        </header>

        <h2 className={styles.modalTitle} id="bounty-detail-title">{bounty.title}</h2>
        <p className={styles.modalSummary}>{bounty.summary}</p>

        <div className={styles.factRow}>
          <div><span className={styles.factLabel}>Difficulty</span><DifficultyPill difficulty={bounty.difficulty} /></div>
          <div><span className={styles.factLabel}>Time</span><strong>~{bounty.estimated_hours} hours</strong></div>
          <div><span className={styles.factLabel}>Skills</span><ul className={styles.chips}>{bounty.skills.map((s) => <li key={s}>{s}</li>)}</ul></div>
        </div>

        <section className={styles.modalSection}>
          <h3>What you&apos;ll do</h3>
          <ol className={styles.stepList}>{bounty.tasks.map((task, i) => <li key={i}>{task}</li>)}</ol>
        </section>

        <section className={styles.modalSection}>
          <h3>Done when</h3>
          <ul className={styles.checkList}>{bounty.done_when.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </section>

        <div className={styles.rewardBox}>
          <span className={styles.factLabel}>Reward</span>
          <p>{bounty.reward}</p>
        </div>
      </div>
    </div>
  );
}
