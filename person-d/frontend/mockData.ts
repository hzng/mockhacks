// TEMPORARY mock data until the bounty board and auth/ are ready.
// - DEMO_USERS: replace with the two accounts from auth/.
// - MOCK_BOUNTIES: real `bounty-<id>` records from the board are merged in and win on the same id.
// - MOCK_TASKS: starting state for the mock bounties; once a task is saved, `task-<id>` in storage wins.
import type { Bounty, Task, User } from "./tasks";

export const DEMO_USERS: User[] = [
  { id: "maria", name: "Maria Lopez", role: "owner", org: "Sunrise Bakery" },
  { id: "kevin", name: "Kevin Chen", role: "student", org: "De Anza College" },
];

export const MOCK_BOUNTIES: Bounty[] = [
  {
    id: "demo-1",
    title: "Show our opening hours on the mobile website",
    ownerId: "maria",
    business: "Sunrise Bakery",
    summary: "Our website shows opening hours on a computer, but they disappear on phones. Customers keep calling to ask if we are open.",
    doneWhen: [
      "Hours are visible on the home page on an iPhone and an Android phone",
      "Hours match the sign on the door: Tue–Sun 7am–3pm",
      "The desktop layout still looks the same",
    ],
    skills: ["HTML/CSS", "Responsive design"],
    hours: 3,
    difficulty: "easy",
    reward: "Verified portfolio entry + a free pastry box",
    claimedBy: "kevin",
  },
  {
    id: "demo-2",
    title: "Translate the holiday order flyer into Spanish and Chinese",
    ownerId: "maria",
    business: "Sunrise Bakery",
    summary: "We hand out a one-page flyer for holiday cake orders. Many of our customers read Spanish or Chinese first.",
    doneWhen: [
      "A Spanish version of the flyer",
      "A Traditional Chinese version of the flyer",
      "Prices and dates match the English flyer exactly",
    ],
    skills: ["Translation", "Canva"],
    hours: 4,
    difficulty: "easy",
    reward: "Verified portfolio entry",
    claimedBy: "kevin",
  },
  {
    id: "demo-3",
    title: "Turn our ingredient orders into a simple spreadsheet",
    ownerId: "maria",
    business: "Sunrise Bakery",
    summary: "We track flour, butter, and sugar orders on paper. We want one sheet that shows what to reorder each week.",
    doneWhen: [
      "One row per ingredient with supplier and unit price",
      "A weekly reorder column that turns red when stock is low",
      "A short how-to note the staff can follow",
    ],
    skills: ["Google Sheets", "Data cleanup"],
    hours: 5,
    difficulty: "medium",
    reward: "Verified portfolio entry + reference letter",
    claimedBy: "kevin",
  },
];

export const MOCK_TASKS: Record<string, Task> = {
  "demo-1": {
    bountyId: "demo-1",
    status: "claimed",
    checked: [false, false, false],
    thread: [
      {
        id: "demo-1-a",
        by: "kevin",
        kind: "comment",
        text: "Hi Maria, I claimed this one. Which site builder do you use, and can you add me as an editor?",
        at: "2026-10-03T17:05:00.000Z",
      },
      {
        id: "demo-1-b",
        by: "maria",
        kind: "comment",
        text: "It's on Wix. I just sent an editor invite to your school email.",
        at: "2026-10-03T17:20:00.000Z",
      },
    ],
  },
  "demo-2": {
    bountyId: "demo-2",
    status: "submitted",
    checked: [true, true, true],
    thread: [
      {
        id: "demo-2-a",
        by: "kevin",
        kind: "submit",
        text: "Both versions are done. I double-checked every price and date against the English flyer.",
        link: "https://example.com/sunrise-holiday-flyer",
        at: "2026-10-03T18:40:00.000Z",
      },
    ],
  },
};
