# Project Status

Tracks milestones, what has been completed, and what comes next. Updated after each major milestone.

---

## Current Phase

**MVP deployed at [wishona.com](https://wishona.com). Currently in V1 feature development.**

MVP is feature-complete and deployed under the Wishona brand. Recent work added link metadata auto-fill, Skimlinks affiliate integration, item image thumbnails, split first/last names, and a redesigned invite email template.

**Installed versions:** Next.js 16.2.4, React 19.2.4, Tailwind v4, shadcn/ui, `@supabase/ssr`, `@supabase/supabase-js`, `resend`, `open-graph-scraper`.

---

## MVP Checklist — ✅ Complete

Full requirements in `project_spec.md §1.6`.

### Setup
- [x] Project spec written (`project_spec.md`)
- [x] GitHub repository created (`ericproud/wishlist`, private)
- [x] `CLAUDE.md`, `.env.example`, and docs scaffolded
- [x] Next.js app scaffolded (Next 16, TypeScript, Tailwind v4, App Router)
- [x] Core dependencies installed (`@supabase/ssr`, `@supabase/supabase-js`, `resend`, `shadcn/ui`)
- [x] Supabase project created, keys in `.env.local`
- [x] Supabase schema applied, RLS policies in place
- [x] Resend account set up with `wishona.com` verified sending domain
- [x] Vercel project connected to GitHub repo, deployed to wishona.com

### Auth
- [x] Sign up (email + password + username)
- [x] Log in / log out
- [x] Middleware redirecting unauthenticated users from protected routes

### Profile
- [x] Edit first name, last name, clothing sizes, interests, wishlist note
- [x] Profile photo upload (Supabase Storage)

### Lists
- [x] Create a named list (auto-generates slug)
- [x] Rename and delete a list
- [x] Multiple lists per user

### Invites
- [x] Send invite by email via Resend (HTML template with Wishona branding)
- [x] Unique token link: `/invite/[token]`
- [x] Invite acceptance page (public, previews list + prompts auth)
- [x] Account linked to invite on sign-up or log-in
- [x] Owner can view pending/accepted invites and revoke pending ones
- [x] Tokens expire after 7 days

### Items
- [x] Add item (name, URL, image, price, quantity, notes)
- [x] Edit and delete items
- [x] Quantity-aware purchase tracking (partial-quantity claim/unclaim supported)
- [x] Auto-fill from URL paste (open-graph-scraper + Amazon regex fallback)
- [x] Image thumbnails in edit and gifter views

### List Page (`/[username]/[slug]`)
- [x] Owner view — redirects to `/list/[id]/edit` (items-only edit page)
- [x] Member view — items + who claimed what + mark purchased / unclaim; partial quantity support
- [x] Non-member / unauthenticated — generic access denied page

### Dashboard
- [x] All owned lists with item counts and pending invite counts
- [x] Links to manage invites and edit items per list
- [x] "Gifting on" section — lists where user has an accepted invite

### Admin (`/admin`)
- [x] Gated to `ADMIN_USER_ID` — non-admins redirected to dashboard
- [x] View all users (username, email, list count, joined date) and lists (name, owner, item count, created date)
- [x] Delete users and lists with inline confirmation

---

## Post-MVP Work — ✅ Delivered

- [x] Full UI redesign: Shopify admin–inspired (dark navy nav, Shopify green primary, DM Sans, AppShell component)
- [x] Design system documented (`docs/design-system.md`)
- [x] App rebranded: Wishlist → Gift Simple → **Wishona**
- [x] Custom domain: `wishona.com` (Vercel + Resend DNS)
- [x] Skimlinks affiliate script on all pages
- [x] Link metadata auto-fill on item add/edit
- [x] Item image thumbnails throughout the app
- [x] Schema migration: `display_name` → `first_name` + `last_name` with three-level fallback display
- [x] HTML invite email redesigned with branding, "What is Wishona?" explainer, and clear CTA

---

## V1 — In Progress

**Goals:** more signups + deeper engagement post-signup. **Time budget:** 1–2 weeks.

V1 scope was scoped down from the original V1 backlog (in `project_spec.md §1.6`) to focus on what makes the *core experience* tighter and more visual. The original V1 items not in this scope (anonymous purchase toggle, "all claimed" notification) are deferred to V1.5 or V2. Gift priority ranking shipped post-V1 as an incremental feature. Item suggestions from gifters was removed from the backlog. Affiliate link rewriting is blocked pending Skimlinks approval.

### Locked-in scope — 5 tracks

#### Track 1 — Quick wins (~½ day) — ✅ Complete
- [x] `updateProfile` server action redirects to `/dashboard` on success
- [x] Pending/disabled states on every async mutation that doesn't have one yet (delete list, delete item, revoke invite, admin deletes, avatar upload progress)

#### Track 2 — Image-forward layout redesign (~5 days) — ✅ Complete
Image-forward grid pattern (Pinterest/Etsy style), keeping the existing color palette (dark nav, green accent) and DM Sans. The current uniform vertical-card-list layout was the main thing that made the app feel boring.
- [x] New shared components: `ListCard`, `ItemTile`, `EmptyStateCard`
- [x] Mobile-first grid wrapper standard (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `2/3/4` for tiles)
- [x] Page-by-page swap: dashboard, member view, item edit, item form (modal → Sheet), invites page, profile form (sectioned), admin tables (overflow-x), app-shell header (hamburger Sheet on mobile)
- [x] Landing page (`app/page.tsx`) redesigned alongside the app pages — hero list mockup + image-led feature cards

#### Track 3 — Manual product image upload (~1 day) — ✅ Complete
- [x] Mirror existing avatar upload pattern in `app/list/[id]/edit/item-form.tsx` and `item-list.tsx`
- [x] Reuse the `avatars` Storage bucket (path: `${userId}/items/${uuid}.${ext}`) — no new bucket
- [x] Manual upload takes precedence; auto-scrape only fills `image_url` when empty
- [x] Best-effort Storage cleanup on item update (when image changes/clears) and item delete

#### Track 4 — Event dates on lists (~1 day) — ✅ Complete
- [x] Migration: add nullable `event_date date` column to `lists` table
- [x] Optional input on list create/edit forms (create + separate rename/date buttons on dashboard)
- [x] Display on dashboard ("in 3 weeks") and member view ("Sarah's birthday — Aug 15")
- [x] `formatEventDate` helper in `lib/utils.ts`
- [x] Dashboard sort: closest future → farthest future → undated → closest past → farthest past
- [x] Past-date lists greyed out at opacity-60

#### Track 5 — Reminder emails (~2 days) — ✅ Complete
- [x] Vercel cron at 9am ET → `/api/cron/send-reminders`
- [x] Reminder cadence: 14 days before + 3 days before (default; tweakable)
- [x] Reuse Resend HTML template pattern from `lib/actions/invites.ts`
- [x] `CRON_SECRET` env var for route auth

### Branching
One PR per track. Tracks 1, 3, 4 are independent. Track 2 should land before Track 4's UI bits because `ListCard` consumes `event_date`. Track 5 depends on Track 4's schema migration.

Detailed plan in the local plan file (not committed).

---

#### Gift priority ranking — ✅ Complete (2026-05-09)
- [x] Priority select (Most wanted / Would love it / Nice to have) on both Add and Edit item forms
- [x] Priority badge rendered on `ItemTile` in owner edit view and member/gifter view
- [x] Items sorted by priority (nulls last) then `created_at` in both views
- [x] No migration — `priority integer` column already existed in DB schema; `addItem` and `updateItem` server actions updated to persist priority

#### Universal invite link — ✅ Complete (2026-05-09)
- [x] `list_invite_links` table with RLS; one row per list, rotatable token
- [x] `lib/actions/invite-links.ts` — generate, deactivate, join via link (admin client bypasses RLS for lookup)
- [x] `app/join/[token]/page.tsx` — public preview page; handles not found, deactivated, already member, unauthenticated, and eligible states
- [x] `app/join/[token]/join-button.tsx` — auto-submits on mount for seamless post-signup join flow
- [x] `app/list/[id]/invites/invite-link-section.tsx` — copy, regenerate (with confirm), deactivate (with confirm); all state derived from action results, no useEffect setState
- [x] Invites page UI redesign: two-column grid (link card + email card), member initials avatars, display names instead of raw emails, "Members" label
- [x] `join` added to reserved usernames to prevent route collision

---

## V1.5 — ✅ Complete

Small polish and UX improvements on top of the shipped V1. All planned items shipped. Item suggestions from gifters was cut. Affiliate link rewriting is blocked pending Skimlinks approval and removed from this milestone.

#### Public list mode — ✅ Complete (2026-05-22)
- [x] "Make public" / "Make private" toggle per list on dashboard; "Public" badge in card metadata
- [x] Unauthenticated visitors see items + "Sign in to claim"; no purchase data shown
- [x] Authenticated non-members get full gifter view and can claim
- [x] All purchases on public lists always display as anonymous ("Someone is getting this")
- [x] Owner visiting their own public list still redirects to edit (owner blindness preserved)
- DB migration: `UPDATE lists SET is_public = false WHERE is_public IS NULL; ALTER TABLE lists ALTER COLUMN is_public SET DEFAULT false;` + updated RLS on `lists` and `items`

#### Anonymous purchase toggle — ✅ Complete (2026-05-22)
- [x] "Claim anonymously" checkbox on the claim form (per-purchase, gifter's choice)
- [x] Anonymous purchases display as "Someone is getting this" to other gifters; claimer always sees "You are getting this"
- DB migration: `ALTER TABLE public.purchases ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;` (already applied)

#### "All claimed" notification email — ✅ Complete (2026-05-09)
- [x] After a gifter claims an item, checks if all items on the list are fully covered
- [x] If yes, emails all accepted gifters: "The list is all covered!" — no gifter names or purchase details revealed
- [x] Atomic `all_claimed_notified_at` flag on `lists` prevents duplicate sends; resets on unclaim so owner is notified again if re-claimed
- [x] `lib/email.ts` — shared `displayName` helper and `buildAllClaimedHtml` template
- DB migration: `ALTER TABLE lists ADD COLUMN all_claimed_notified_at timestamptz;`

#### Filter bar on list page — ✅ Complete (2026-05-09)
- [x] "Available only" toggle on gifter member view — hides fully-claimed items, live count label always visible
- Extracts grid into new `ItemsGrid` client component (`app/[username]/[slug]/items-grid.tsx`); `MemberView` stays a server component

#### Priority select label fix — ✅ Complete (2026-05-09)
- [x] "No priority" → "—" in both priority select dropdowns (Add item + Edit item forms)

#### Request access CTA on access-denied page — ✅ Complete (2026-05-09)
- [x] Email form on access-denied page; visitor enters email → owner notified via Resend; success state replaces form
- New `RequestAccessForm` client component (`app/[username]/[slug]/request-access-form.tsx`); `requestAccess` server action added to `lib/actions/invites.ts`

---

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| Planning & spec | ✅ Complete | `project_spec.md` is the source of truth |
| Repo & tooling setup | ✅ Complete | |
| App scaffolding | ✅ Complete | Next 16, React 19, Tailwind v4, shadcn/ui |
| Auth (sign up / log in) | ✅ Complete | |
| Profile | ✅ Complete | first_name + last_name (post-MVP refactor) |
| Lists | ✅ Complete | |
| Invites + email | ✅ Complete | Resend on wishona.com domain |
| Items | ✅ Complete | Includes link auto-fill + images |
| List page (3-view) | ✅ Complete | |
| Dashboard | ✅ Complete | |
| Admin | ✅ Complete | |
| Deploy to Vercel | ✅ Complete | Live at wishona.com |
| Design redesign | ✅ Complete | Shopify admin–inspired |
| Skimlinks integration | ✅ Complete | Affiliate ID `302378X1790378` |
| Email template redesign | ✅ Complete | Branded HTML invite emails |
| MVP complete | ✅ Complete | All requirements shipped |
