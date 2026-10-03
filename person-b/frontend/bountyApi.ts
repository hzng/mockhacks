// Person B's bounty API (person-b/backend). Runs standalone on :8001 until the
// integration owner mounts the router into the shared backend; then set
// NEXT_PUBLIC_BOUNTY_API_URL="" so requests go through the /api rewrite.
const API_BASE = process.env.NEXT_PUBLIC_BOUNTY_API_URL ?? "http://localhost:8001";

export type Difficulty = "easy" | "medium" | "hard";

export type BountyCard = {
  title: string;
  summary: string;
  tasks: string[];
  done_when: string[];
  skills: string[];
  estimated_hours: number;
  difficulty: Difficulty;
  reward: string;
  business_name: string;
};

export type SavedBounty = BountyCard & {
  id: string;
  owner_name: string;
  status: string;
  created_at: string;
};

export type GenerateResult = { card: BountyCard; source: "ai" | "fallback" };

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { loc: string[]; msg: string }) => `${d.loc.at(-1)}: ${d.msg}`).join("; ");
    }
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // non-JSON error body; use the generic message below
  }
  return `Server returned ${response.status}`;
}

export async function generateBounty(problem: string): Promise<GenerateResult> {
  const response = await fetch(`${API_BASE}/api/bounties/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem }),
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  const source = response.headers.get("X-Bounty-Source") === "ai" ? "ai" : "fallback";
  return { card: (await response.json()) as BountyCard, source };
}

export async function postBounty(card: BountyCard): Promise<SavedBounty> {
  const response = await fetch(`${API_BASE}/api/bounties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as SavedBounty;
}

export async function listBounties(): Promise<SavedBounty[]> {
  const response = await fetch(`${API_BASE}/api/bounties`, { cache: "no-store" });
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as SavedBounty[];
}
