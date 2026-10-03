// Reads and writes task data through the shared backend storage API (/api/storage/{key}).
import { MOCK_BOUNTIES, MOCK_TASKS } from "./mockData";
import {
  applyAction,
  newTask,
  relatedTo,
  verifiedEntryFor,
  type Action,
  type Bounty,
  type Task,
  type User,
  type VerifiedEntry,
} from "./tasks";

const STORAGE = "/api/storage";

async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${STORAGE}${path}`, { cache: "no-store", ...init });
  } catch {
    throw new Error("Can't reach the local backend. Start the app with start.bat or start.sh.");
  }
}

async function readKey<T>(key: string): Promise<T | null> {
  const response = await request(`/${encodeURIComponent(key)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Storage returned ${response.status}.`);
  return ((await response.json()) as { value: T }).value;
}

async function writeKey(key: string, value: unknown): Promise<void> {
  const response = await request(`/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Storage returned ${response.status}.`);
}

// Listing the keys first means we only GET keys that exist, so polling a mock bounty
// doesn't fill the browser console with 404s.
async function storedKeys(): Promise<Set<string>> {
  const response = await request("");
  if (!response.ok) throw new Error(`Storage returned ${response.status}.`);
  return new Set(((await response.json()) as { keys: string[] }).keys);
}

async function readStored<T>(keys: Set<string>, key: string): Promise<T | null> {
  return keys.has(key) ? readKey<T>(key) : null;
}

function looksLikeBounty(value: unknown): value is Bounty {
  const bounty = value as Bounty | null;
  return typeof bounty?.id === "string" && typeof bounty.title === "string" && Array.isArray(bounty.doneWhen);
}

async function findBounty(keys: Set<string>, id: string): Promise<Bounty | null> {
  const stored = await readStored<unknown>(keys, `bounty-${id}`);
  if (looksLikeBounty(stored)) return stored;
  return MOCK_BOUNTIES.find((bounty) => bounty.id === id) ?? null;
}

async function findTask(keys: Set<string>, bounty: Bounty): Promise<Task> {
  return (await readStored<Task>(keys, `task-${bounty.id}`)) ?? MOCK_TASKS[bounty.id] ?? newTask(bounty);
}

export async function loadTaskView(bountyId: string): Promise<{ bounty: Bounty | null; task: Task | null }> {
  const keys = await storedKeys();
  const bounty = await findBounty(keys, bountyId);
  return { bounty, task: bounty ? await findTask(keys, bounty) : null };
}

export async function loadMyTasks(user: User): Promise<{ bounty: Bounty; task: Task }[]> {
  const keys = await storedKeys();
  const ids = [...keys].filter((key) => key.startsWith("bounty-")).map((key) => key.slice("bounty-".length));
  const stored = (await Promise.all(ids.map((id) => readKey<unknown>(`bounty-${id}`)))).filter(looksLikeBounty);
  const storedIds = new Set(stored.map((bounty) => bounty.id));
  const bounties = [...stored, ...MOCK_BOUNTIES.filter((bounty) => !storedIds.has(bounty.id))];
  const mine = bounties.filter((bounty) => relatedTo(bounty, user));
  return Promise.all(mine.map(async (bounty) => ({ bounty, task: await findTask(keys, bounty) })));
}

async function addVerifiedEntry(keys: Set<string>, studentId: string, entry: VerifiedEntry): Promise<void> {
  const key = `verified-${studentId}`;
  const entries = (await readStored<VerifiedEntry[]>(keys, key)) ?? [];
  if (entries.some((existing) => existing.bountyId === entry.bountyId)) return;
  await writeKey(key, [...entries, entry]);
}

export async function performAction(bounty: Bounty, user: User, action: Action): Promise<Task> {
  // Re-read right before writing so we build on the other person's latest change.
  const keys = await storedKeys();
  const latest = await findTask(keys, bounty);
  const next = applyAction(latest, bounty, user, action, new Date().toISOString(), crypto.randomUUID());
  await writeKey(`task-${bounty.id}`, next);
  if (next.status === "approved" && bounty.claimedBy) {
    await addVerifiedEntry(keys, bounty.claimedBy, verifiedEntryFor(next, bounty, user));
  }
  return next;
}
