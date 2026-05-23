# Session Context — Handoff

**Last updated:** 2026-05-23
**Last session:** Planned V2 feature set — 5 tracks documented in `docs/project_status.md`
**Next priority:** V2 Track 1 — Mobile-First Navigation

---

## Current State

- **V1 all 5 tracks** — ✅ Merged and deployed to wishona.com
- **Universal invite link** — ✅ Live in production; `list_invite_links` migration run, Supabase types regenerated
- **Gift priority ranking** — ✅ Merged and deployed; `priority` column was already in DB, no migration needed
- **`/wrap-up` command** — ✅ Live at `.claude/skills/wrap-up/SKILL.md`
- **CRON_SECRET** — set manually in Vercel env vars (Vercel does NOT auto-generate this)
- **Filter bar** — ✅ Merged (PR #28)
- **Priority select label** — ✅ Merged (PR #29)
- **Request access CTA** — ✅ Merged (PR #30); no DB changes; dev mode skips email
- **"All claimed" notification** — ✅ Merged (PR #31); emails all accepted gifters when every item is claimed; PR description corrected post-merge; DB migration required: `ALTER TABLE lists ADD COLUMN all_claimed_notified_at timestamptz;`
- **Anonymous purchase toggle** — ✅ Merged (PR #32); per-purchase checkbox; DB migration applied: `ALTER TABLE purchases ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;`
- **Public list mode** — ✅ Merged (PR #33); dashboard toggle per list; unauth visitors see items + "Sign in to claim"; auth non-members get full gifter view; all purchases on public lists always anonymous; DB migration applied to production

## What's Next

V2 planned — 5 tracks, all UX/visual polish, no DB migrations. Full track details in `docs/project_status.md`. Tackle one track per session in order:

1. **Track 1 (next):** Mobile-First Navigation — bottom tab bar, larger tap targets, sticky list header
2. Track 2: Dashboard Improvements — quick share, item/gifter counts, empty state
3. Track 3: Gifter Experience Polish — claimed state, quantity display, priority sections, 1-tap claim
4. Track 4: Onboarding & First-Time UX — welcome banner, empty state coaching, profile nudge
5. Track 5: Sharing Flow — share sheet component, share button on list page, QR code on invite page

Skimlinks affiliate approval still pending — link rewriting not in V2 scope.

## Active Branches

None.

## Blockers / Decisions

None outstanding.

## Gotchas to Remember

1. RLS is the security boundary — never bypass with service role key on client
2. Owner blindness — list owners must never see purchase data (RLS enforces)
3. Timezone-safe dates — `new Date(y, m-1, d)`, not `new Date('YYYY-MM-DD')`
4. Server Actions — always fetch auth'd user server-side, never trust client ID
5. Race conditions on quantity — calculate available qty on server before accepting claim
6. `.claude/*` in .gitignore with exceptions for SESSION_CONTEXT.md and settings.json
7. CRON_SECRET: Vercel does NOT auto-generate — must be set manually in Vercel dashboard
8. Don't let work pile up uncommitted — Track 4 code was lost once this way
