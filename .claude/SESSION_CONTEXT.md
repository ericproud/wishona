# Session Context — Handoff

**Last updated:** 2026-05-05
**Last session:** Documentation optimization + pattern extraction
**Next priority:** V1 Track 5 (reminder emails)

---

## Current State

- **V1 Track 4 (event dates)** — ✅ Merged PR #21
- **Docs optimization + pattern extraction** — ✅ Merged PR #22. 9 pattern files in memory system.
- **Session handoff system** — ✅ This file + CLAUDE.md directive

## What's Next

**V1 Track 5 — Reminder emails (~2 days)**
- Branch: `feature/v1-track-5-reminders`
- Vercel cron at 9am ET → `/api/cron/send-reminders`
- Cadence: 14 days before + 3 days before event_date
- Reuse Resend HTML email pattern from `lib/actions/invites.ts`
- Add `CRON_SECRET` env var for route auth
- Schema dependency: Track 4's `event_date` column (already live)

## Useful Context

- **Memory patterns:** 9 files in `.claude/projects/.../memory/` — covers server actions, RLS, images, quantities, user display, dates, slugs, page headers
- **Active branch:** `main` (clean)
- **Deployed:** wishona.com

## Blockers / Decisions

None outstanding.

## Gotchas to Remember

1. RLS is the security boundary — never bypass with service role key on client
2. Owner blindness — list owners must never see purchase data (RLS enforces)
3. Timezone-safe dates — `new Date(y, m-1, d)`, not `new Date('YYYY-MM-DD')`
4. Server Actions — always fetch auth'd user server-side, never trust client ID
5. Race conditions on quantity — calculate available qty on server before accepting claim
