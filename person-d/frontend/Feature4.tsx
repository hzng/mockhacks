"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DemoUserSwitcher, useCurrentUser } from "./currentUser";
import TaskList from "./TaskList";
import TaskPage from "./TaskPage";

// /feature-4 lists the signed-in user's claimed bounties; /feature-4?bounty=<id> opens one task.
export default function Feature4() {
  return (
    <main>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <TaskRoute />
      </Suspense>
    </main>
  );
}

function TaskRoute() {
  const bountyId = useSearchParams().get("bounty");
  const user = useCurrentUser();
  if (!user) return <p className="muted">Loading…</p>;

  return (
    <>
      <DemoUserSwitcher current={user} />
      {bountyId ? (
        <TaskPage bountyId={bountyId} key={bountyId} user={user} />
      ) : (
        <TaskList key={user.id} user={user} />
      )}
    </>
  );
}
