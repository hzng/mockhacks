/**
 * Person C — personal profile page.
 *
 * Shows the current person's work records, based on Page D's completion:
 * - Page D (person-d/**) runs the bounty workflow (claim → submit → approve).
 *   When the owner approves, it appends a VerifiedEntry to the shared backend
 *   store at key `verified-<studentId>` (JSON array, deduped by bountyId).
 * - This page only READS that data. (Page D's own comment: verified entries
 *   are "read by the profile page".)
 *
 * Integration contract (Page D owns the writes — do not change unilaterally):
 * - Storage keys: `verified-<studentId>`, `bounty-<id>`.
 * - Storage API: GET /api/storage/{key} → 404 if missing, else {key, value};
 *   PUT stores the raw JSON body; GET /api/storage → {keys, count}.
 * - Demo identity: Page D keeps the current demo user id in sessionStorage
 *   under `person-d-demo-user`, deliberately per tab (so one tab can be the
 *   owner and another the student). This page reads/writes the SAME key so
 *   both pages agree on who's signed in within a tab.
 * - Demo users mirror person-d/frontend/mockData.ts DEMO_USERS (temporary
 *   until auth/ lands): maria = owner "Maria Lopez" / "Sunrise Bakery",
 *   kevin = student "Kevin Chen" / "De Anza College".
 */

export type Role = "owner" | "student";

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  org: string;
}

export const DEMO_USERS: DemoUser[] = [
  { id: "maria", name: "Maria Lopez", role: "owner", org: "Sunrise Bakery" },
  { id: "kevin", name: "Kevin Chen", role: "student", org: "De Anza College" },
];

export const DEMO_USER_KEY = "person-d-demo-user";

/** Mirror of person-d/frontend/tasks.ts VerifiedEntry (Page D owns the writes). */
export interface VerifiedEntry {
  bountyId: string;
  title: string;
  business: string;
  approvedBy: string;
  link: string;
  approvedAt: string;
}

/** Minimal read view of a bounty for the owner's posted-bounty list. */
export interface PostedBounty {
  id: string;
  title: string;
  business: string;
  ownerId: string;
  claimedBy: string | null;
}

const STORAGE = "/api/storage";

/**
 * Temporary fallback mirror of person-d's MOCK_BOUNTIES (see
 * person-d/frontend/mockData.ts on main). Nobody writes real `bounty-<id>`
 * records to the shared store yet — the bounty board (person A/B) isn't
 * built — so without this the owner's posted list would be empty in the
 * demo. Real stored bounties win on id conflict, same rule as Page D's
 * taskStore. Kept as plain data (not an import) so this page builds on a
 * branch that doesn't have person-d's new files yet. Delete this when the
 * real board writes `bounty-<id>` records.
 */
const MOCK_POSTED: PostedBounty[] = [
  {
    id: "demo-1",
    title: "Show our opening hours on the mobile website",
    business: "Sunrise Bakery",
    ownerId: "maria",
    claimedBy: "kevin",
  },
  {
    id: "demo-2",
    title: "Translate the holiday order flyer into Spanish and Chinese",
    business: "Sunrise Bakery",
    ownerId: "maria",
    claimedBy: "kevin",
  },
  {
    id: "demo-3",
    title: "Turn our ingredient orders into a simple spreadsheet",
    business: "Sunrise Bakery",
    ownerId: "maria",
    claimedBy: null,
  },
];

function unreachable(): Error {
  return new Error("Can't reach the local backend. Start the app with ./start.sh.");
}

async function readKey<T>(key: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${STORAGE}/${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
  } catch {
    throw unreachable();
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Storage returned ${response.status}.`);
  return ((await response.json()) as { value: T }).value;
}

function isVerifiedEntry(value: unknown): value is VerifiedEntry {
  const entry = value as VerifiedEntry | null;
  return (
    typeof entry?.bountyId === "string" &&
    typeof entry?.title === "string" &&
    typeof entry?.business === "string" &&
    typeof entry?.approvedBy === "string" &&
    typeof entry?.link === "string" &&
    typeof entry?.approvedAt === "string"
  );
}

/** Verified work records for a student (the portfolio). Empty when none yet. */
export async function loadVerifiedRecords(
  studentId: string,
): Promise<VerifiedEntry[]> {
  const value = await readKey<unknown>(`verified-${studentId}`);
  if (!Array.isArray(value)) return [];
  return value.filter(isVerifiedEntry);
}

function looksLikeBounty(value: unknown): value is PostedBounty {
  const bounty = value as PostedBounty | null;
  return (
    typeof bounty?.id === "string" &&
    typeof bounty?.title === "string" &&
    typeof bounty?.business === "string" &&
    typeof bounty?.ownerId === "string"
  );
}

/**
 * Bounties posted by an owner: real `bounty-<id>` records from the shared
 * store, plus the temporary mock fallback above (removed once the real
 * bounty board writes to the store).
 */
export async function loadPostedBounties(
  ownerId: string,
): Promise<PostedBounty[]> {
  let keys: string[];
  try {
    const response = await fetch(STORAGE, { cache: "no-store" });
    if (!response.ok) throw new Error(`Storage returned ${response.status}.`);
    keys = ((await response.json()) as { keys: string[] }).keys;
  } catch {
    throw unreachable();
  }
  const bountyKeys = keys.filter((key) => key.startsWith("bounty-"));
  const settled = await Promise.all(
    bountyKeys.map(async (key) => {
      try {
        return await readKey<unknown>(key);
      } catch {
        return null;
      }
    }),
  );
  const stored = settled
    .filter(looksLikeBounty)
    .map((bounty) => ({
      id: bounty.id,
      title: bounty.title,
      business: bounty.business,
      ownerId: bounty.ownerId,
      claimedBy: bounty.claimedBy ?? null,
    }));
  // Real stored bounties win on id conflict; mocks fill the demo gap.
  const merged = [...stored];
  for (const mock of MOCK_POSTED) {
    if (!merged.some((bounty) => bounty.id === mock.id)) merged.push(mock);
  }
  return merged.filter((bounty) => bounty.ownerId === ownerId);
}

export function findDemoUser(id: string | null): DemoUser {
  return DEMO_USERS.find((user) => user.id === id) ?? DEMO_USERS[0];
}

export function readDemoUserId(): string | null {
  try {
    return window.sessionStorage.getItem(DEMO_USER_KEY);
  } catch {
    return null;
  }
}

export function writeDemoUserId(id: string): void {
  try {
    window.sessionStorage.setItem(DEMO_USER_KEY, id);
  } catch {
    // Storage blocked: the switch won't stick, but the page keeps working.
  }
}
