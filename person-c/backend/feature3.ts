/**
 * Person C — submission review flow.
 *
 * Volunteer submits finished work -> poster approves or rejects ->
 * approved submissions become verified completion records.
 *
 * Persistence uses the shared local backend file store through the
 * `/api/storage/<key>` endpoints (see backend/app/api/routes.py).
 * Browser-only state (role, display name) lives in localStorage.
 */

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  taskTitle: string;
  volunteerName: string;
  link: string;
  note: string;
  status: SubmissionStatus;
  reviewerNote: string;
  createdAt: string; // ISO timestamp
  reviewedAt: string | null; // ISO timestamp
}

/** Key used in the shared local backend file store. */
export const SUBMISSIONS_KEY = "person-c-submissions";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSubmission(input: {
  taskTitle: string;
  volunteerName: string;
  link: string;
  note: string;
}): Submission {
  return {
    id: newId(),
    taskTitle: input.taskTitle.trim(),
    volunteerName: input.volunteerName.trim() || "Anonymous volunteer",
    link: input.link.trim(),
    note: input.note.trim(),
    status: "pending",
    reviewerNote: "",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };
}

export function reviewSubmission(
  submission: Submission,
  approved: boolean,
  reviewerNote: string,
): Submission {
  return {
    ...submission,
    status: approved ? "approved" : "rejected",
    reviewerNote: reviewerNote.trim(),
    reviewedAt: new Date().toISOString(),
  };
}

export function resubmitSubmission(submission: Submission): Submission {
  return {
    ...submission,
    status: "pending",
    reviewerNote: "",
    reviewedAt: null,
  };
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);
  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }
  return response.json();
}

export async function loadSubmissions(): Promise<Submission[]> {
  try {
    const data = (await fetchJson(`/api/storage/${SUBMISSIONS_KEY}`)) as {
      value: unknown;
    };
    return Array.isArray(data.value) ? (data.value as Submission[]) : [];
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return [];
    throw error;
  }
}

export async function saveSubmissions(
  submissions: Submission[],
): Promise<void> {
  await fetchJson(`/api/storage/${SUBMISSIONS_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submissions),
  });
}
