# Community Bridge

**Pitch:** Connect the Community with College

## Problem
- De Anza is a commuter school with no dorms. Students leave as soon as class ends, so they barely interact with Cupertino.
- Local businesses and nonprofits have small real problems (a broken website, a flyer that needs translating, a spreadsheet nobody understands) and no one to ask.
- Students want real projects for their résumé and transfer applications, but class assignments are made-up cases.
- Students have no easy way to find these local problems or the people and resources around campus.

## Solution
A bounty board for the city. Locals post a problem in plain words, and AI turns it into a clear bounty card. Students claim it, solve it, and earn a verified portfolio entry signed by the business.

- **Students** look for a challenge and earn the bounty.
- **Locals** want their problem solved.
- **Real Brief:** a bounty can also be tagged as a fit for a De Anza course, so a professor can use it as a real class assignment.

## Core Flow
The one main thing a user does, step by step:
1. A local business owner opens Community Bridge and types the problem in plain words ("Our bakery's website doesn't show our hours on phones").
2. AI turns it into a bounty card: what to do, a "done when" checklist, skills needed, estimated hours, difficulty, and the reward.
3. The owner checks the card and posts it to the board.
4. A student browses the board, filters by skill, and claims the bounty.
5. The student submits a link and a short note. The owner marks it done.
6. The student's profile shows a verified entry from the business.

## MVP Features (must work in the demo)
- [ ] Plain-words problem → AI-generated bounty card (this is the core, spend the most time here)
- [ ] Bounty board: list, filter by skill and difficulty, claim a bounty
- [ ] Submit → owner approves → verified entry appears on the student profile

Stretch, only after all three work end to end:
- [ ] Course tag on a bounty card (Real Brief)

## Out of Scope (do NOT build)
- Cash payments. F-1 students generally can't take paid off-campus work, and payments take too long to build anyway. Rewards are portfolio entries and local perks.
- Login and accounts. Use two hardcoded demo users: one local owner, one student.
- Chat or messaging between users
- Ratings, reviews, disputes
- Professor dashboard, Canvas integration
- Maps, notifications, email
- Native mobile app (a responsive web page is enough)

## Tech Stack
Swap any of these for what the team already knows. Don't learn something new today.
- Frontend: React + Vite + Tailwind
- Backend: Python + FastAPI
- Data: SQLite, or a JSON file seeded with 6–8 mock bounties
- AI/API: Claude API, one call that turns the plain-words problem into a bounty card (JSON)
- Hosting: run locally for the demo; deploy to Render or Vercel only if there's time

## Rules for the AI
- Keep it simple, no over-engineering
- Build one feature at a time and make sure it runs before moving on
- Use mock data if an API isn't ready
- Don't add libraries or features I didn't ask for
- If the AI call fails, fall back to a saved example card so the demo never breaks

## Demo (2 min)
Hook -> live demo of the core flow -> what's next

- **0:00–0:15 Hook:** "De Anza has no dorms. Students drive in, go to class, and drive out. Meanwhile the shop across the street has had a broken website for months."
- **0:15–1:30 Live demo:** Type a real problem from a real local we talked to during the hackathon. Show the bounty card appear, post it, claim it as a student, submit, approve, and show the verified entry on the profile.
- **1:30–2:00 What's next:** course tags so professors can turn bounties into class assignments (Real Brief), then pilot with one class and a handful of Cupertino businesses.

Before judging: get at least one real request from a real local business or person during the event, and use it in the demo.

## Notes
- Fix SJ

##
