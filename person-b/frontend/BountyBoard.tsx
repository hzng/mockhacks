"use client";

import { useEffect, useState } from "react";
import { listBounties, type SavedBounty } from "./bountyApi";
import { BountyDetail, BountyTile } from "./BountyTile";
import styles from "./bounties.module.css";

export function BountyBoard({ highlightId }: { highlightId: string | null }) {
  const [bounties, setBounties] = useState<SavedBounty[] | null>(null);
  const [openBounty, setOpenBounty] = useState<SavedBounty | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listBounties()
      .then((result) => { if (active) setBounties(result); })
      .catch(() => { if (active) setError("Could not load the board. Is the bounty API running on port 8001?"); });
    return () => { active = false; };
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!bounties) return <p className="muted">Loading bounties…</p>;

  return (
    <>
      <p className={styles.boardCount}>{bounties.length} open bounties from Cupertino businesses</p>
      <section className={styles.board} aria-label="Bounty board">
        {bounties.map((bounty) => (
          <BountyTile
            bounty={bounty}
            createdAt={bounty.created_at}
            highlight={bounty.id === highlightId}
            key={bounty.id}
            onOpen={() => setOpenBounty(bounty)}
          />
        ))}
      </section>
      {openBounty && (
        <BountyDetail bounty={openBounty} createdAt={openBounty.created_at} onClose={() => setOpenBounty(null)} />
      )}
    </>
  );
}
