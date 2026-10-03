"use client";

import { useEffect, useState } from "react";
import { generateBounty, postBounty, type BountyCard, type SavedBounty } from "./bountyApi";
import { BountyEditor, cleanCard } from "./BountyEditor";
import { Avatar, BountyTile } from "./BountyTile";
import styles from "./bounties.module.css";

export const DEMO_OWNER = { name: "Maria Lopez", business: "Sweet Crumb Bakery" };

const EXAMPLES = [
  "Our bakery's website doesn't show our hours on phones",
  "We need our menu translated into Spanish and Chinese",
  "Our inventory spreadsheet is a mess and nobody understands it",
  "We need a flyer for our weekend sale",
];

const LOADING_STEPS = [
  "Reading your problem",
  "Breaking it into tasks",
  "Writing a checklist you can verify",
  "Choosing a reward",
];

export function PostProblem({ onPosted }: { onPosted: (bounty: SavedBounty) => void }) {
  const [problem, setProblem] = useState("");
  const [card, setCard] = useState<BountyCard | null>(null);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [busy, setBusy] = useState<"generating" | "posting" | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (busy !== "generating") return;
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep((step) => Math.min(step + 1, LOADING_STEPS.length - 1)), 1100);
    return () => clearInterval(timer);
  }, [busy]);

  const canGenerate = busy === null && problem.trim().length >= 5;

  async function generate() {
    if (!canGenerate) return;
    setBusy("generating");
    setError("");
    try {
      const result = await generateBounty(problem.trim());
      setCard(result.card);
      setSource(result.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function post() {
    if (!card) return;
    setBusy("posting");
    setError("");
    try {
      onPosted(await postBounty(cleanCard(card)));
    } catch (e) {
      setError(e instanceof Error ? `Couldn't post: ${e.message}` : "Couldn't post. Try again.");
      setBusy(null);
    }
  }

  return (
    <div className={styles.postLayout}>
      <section className={styles.composer}>
        <div className={styles.ownerChip}>
          <Avatar name={DEMO_OWNER.business} />
          <span>Posting as <strong>{DEMO_OWNER.name}</strong> · {DEMO_OWNER.business}</span>
        </div>

        <label className={styles.composerHeading} htmlFor="problem">What do you need help with?</label>
        <p className={styles.composerSub}>
          Describe it the way you&apos;d tell a friend. We&apos;ll turn it into a clear task that De Anza students can pick up.
        </p>

        <div className={styles.composerBox}>
          <textarea
            className={styles.problemInput}
            id="problem"
            maxLength={2000}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            placeholder="e.g. Our website doesn't show our hours on phones, so customers keep calling to ask when we're open."
            rows={4}
            value={problem}
          />
          <div className={styles.composerBar}>
            <span className={styles.hint}>⌘ + Enter to generate</span>
            <button className={styles.primaryButton} disabled={!canGenerate} onClick={generate} type="button">
              {busy === "generating" ? "Writing your card…" : card ? "Regenerate" : "Generate bounty card"}
            </button>
          </div>
        </div>

        {!card && busy !== "generating" && (
          <div className={styles.examples}>
            <span className={styles.hint}>Try an example:</span>
            {EXAMPLES.map((example) => (
              <button className={styles.exampleChip} key={example} onClick={() => setProblem(example)} type="button">
                {example}
              </button>
            ))}
          </div>
        )}

        {busy === "generating" && (
          <ol className={styles.loadingSteps} aria-live="polite">
            {LOADING_STEPS.map((step, i) => (
              <li className={i < loadingStep ? styles.stepDone : i === loadingStep ? styles.stepActive : styles.stepPending} key={step}>
                {step}
              </li>
            ))}
          </ol>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>

      {card && (
        <section className={styles.review} aria-label="Review your bounty card">
          <div className={styles.reviewMain}>
            <div className={styles.reviewHeader}>
              <h2>Review and edit</h2>
              <span className={source === "ai" ? styles.sourceAi : styles.sourceFallback}>
                {source === "ai" ? "Written by AI · edit anything" : "AI unavailable · example card, edit before posting"}
              </span>
            </div>
            <BountyEditor card={card} onChange={setCard} />
          </div>

          <aside className={styles.previewColumn}>
            <span className={styles.previewLabel}>How students will see it</span>
            <BountyTile bounty={card} />
            <div className={styles.postActions}>
              <button className={styles.primaryButton} disabled={busy !== null} onClick={post} type="button">
                {busy === "posting" ? "Posting…" : "Post to board"}
              </button>
              <button className={styles.ghostButton} disabled={busy !== null} onClick={() => { setCard(null); setSource(null); }} type="button">
                Discard
              </button>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
