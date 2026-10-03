// Data shapes and rules for the post-claim task page.
// Pure functions only (no fetch, no React) so the rules can be tested on their own.

export type Role = "owner" | "student";

export type User = {
  id: string;
  name: string;
  role: Role;
  org: string;
};

// Written by the bounty board (stored at `bounty-<id>`). This page only reads it.
export type Bounty = {
  id: string;
  title: string;
  ownerId: string;
  business: string;
  summary: string;
  doneWhen: string[];
  skills: string[];
  hours: number;
  difficulty: "easy" | "medium" | "hard";
  reward: string;
  claimedBy: string | null;
};

export type TaskStatus = "claimed" | "submitted" | "changes_requested" | "approved";

export type ThreadKind = "comment" | "submit" | "request_changes" | "approve";

export type ThreadEntry = {
  id: string;
  by: string;
  kind: ThreadKind;
  text: string;
  link?: string;
  at: string;
};

// Owned by this page (stored at `task-<bountyId>`).
export type Task = {
  bountyId: string;
  status: TaskStatus;
  checked: boolean[];
  thread: ThreadEntry[];
};

// Written by this page when the owner approves (stored at `verified-<studentId>`), read by the profile page.
export type VerifiedEntry = {
  bountyId: string;
  title: string;
  business: string;
  approvedBy: string;
  link: string;
  approvedAt: string;
};

export type Action =
  | { kind: "comment"; text: string }
  | { kind: "submit"; link: string; text: string }
  | { kind: "request_changes"; text: string }
  | { kind: "approve"; text: string }
  | { kind: "toggle_check"; index: number };

export const STATUS_LABELS: Record<TaskStatus, string> = {
  claimed: "In progress",
  submitted: "Waiting for review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function newTask(bounty: Bounty): Task {
  return {
    bountyId: bounty.id,
    status: "claimed",
    checked: bounty.doneWhen.map(() => false),
    thread: [],
  };
}

export function roleIn(bounty: Bounty, user: User): Role | null {
  if (user.id === bounty.ownerId) return "owner";
  if (bounty.claimedBy !== null && user.id === bounty.claimedBy) return "student";
  return null;
}

export function isSafeLink(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Returns why the action is not allowed, or null if it is.
export function whyNot(task: Task, bounty: Bounty, user: User, action: Action): string | null {
  const role = roleIn(bounty, user);
  if (role === null) return "Only the business owner and the student on this bounty can do that.";
  if (task.status === "approved") return "This task is already approved and closed.";
  const working = task.status === "claimed" || task.status === "changes_requested";

  switch (action.kind) {
    case "comment":
      return action.text.trim() ? null : "Write a message first.";
    case "toggle_check":
      if (role !== "student") return "Only the student can tick the checklist.";
      if (!working) return "The checklist is locked while the work is under review.";
      return action.index >= 0 && action.index < task.checked.length ? null : "That checklist item does not exist.";
    case "submit":
      if (role !== "student") return "Only the student can submit work.";
      if (!working) return "The work is already submitted.";
      return isSafeLink(action.link.trim()) ? null : "Add a link that starts with https://.";
    case "request_changes":
      if (role !== "owner") return "Only the business owner can request changes.";
      if (task.status !== "submitted") return "There is no submission to review.";
      return action.text.trim() ? null : "Tell the student what to change.";
    case "approve":
      if (role !== "owner") return "Only the business owner can approve.";
      return task.status === "submitted" ? null : "There is no submission to approve.";
  }
}

export function applyAction(task: Task, bounty: Bounty, user: User, action: Action, at: string, id: string): Task {
  const problem = whyNot(task, bounty, user, action);
  if (problem) throw new Error(problem);

  if (action.kind === "toggle_check") {
    const checked = task.checked.map((value, index) => (index === action.index ? !value : value));
    return { ...task, checked };
  }

  const entry: ThreadEntry = { id, by: user.id, kind: action.kind, text: action.text.trim(), at };
  if (action.kind === "submit") entry.link = action.link.trim();

  const nextStatus: Record<ThreadKind, TaskStatus> = {
    comment: task.status,
    submit: "submitted",
    request_changes: "changes_requested",
    approve: "approved",
  };
  return { ...task, status: nextStatus[action.kind], thread: [...task.thread, entry] };
}

export function latestSubmission(task: Task): ThreadEntry | undefined {
  return task.thread.findLast((entry) => entry.kind === "submit");
}

export function verifiedEntryFor(task: Task, bounty: Bounty, owner: User): VerifiedEntry {
  const approval = task.thread.findLast((entry) => entry.kind === "approve");
  const submission = latestSubmission(task);
  if (task.status !== "approved" || !approval || !submission?.link) {
    throw new Error("Only an approved task with a submitted link becomes a verified entry.");
  }
  return {
    bountyId: bounty.id,
    title: bounty.title,
    business: bounty.business,
    approvedBy: owner.name,
    link: submission.link,
    approvedAt: approval.at,
  };
}

export function relatedTo(bounty: Bounty, user: User): boolean {
  return bounty.claimedBy !== null && roleIn(bounty, user) !== null;
}
