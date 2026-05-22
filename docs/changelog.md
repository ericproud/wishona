# Changelog

All notable changes to this project will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added (Anonymous purchase toggle — 2026-05-22)
- `purchases.is_anonymous` column (`boolean NOT NULL DEFAULT false`) — migration applied to production
- "Claim anonymously" checkbox in `item-card.tsx` claim form; unchecked by default
- Anonymous purchases render as "Someone is getting this" to other gifters; claimer always sees their own "You are getting this"
- `markPurchased` server action reads `is_anonymous` from FormData and persists it on insert
- `page.tsx` purchases select updated to include `is_anonymous` in the column list (bug caught during testing — was missing from the original query)

### Added ("All claimed" notification email — 2026-05-09)
- `lib/email.ts` (new) — shared `displayName` helper and `buildAllClaimedHtml` HTML email template
- `maybeNotifyGiftersAllClaimed` in `lib/actions/purchases.ts` — fires after each purchase; queries all items + purchases; if fully covered, does an atomic update on `lists.all_claimed_notified_at` and emails all accepted gifters
- `unmarkPurchased` updated to accept `listId` and reset `all_claimed_notified_at` on unclaim so the notification re-fires if everything gets reclaimed
- `item-card.tsx` — passes `item.list_id` through to `unmarkPurchased` bind
- DB migration: `ALTER TABLE lists ADD COLUMN all_claimed_notified_at timestamptz;`

### Added (Request access CTA — 2026-05-09)
- `app/[username]/[slug]/request-access-form.tsx` (new) — client component with email input and `useActionState`; transitions to "Request sent" confirmation on success
- `requestAccess` server action in `lib/actions/invites.ts` — validates email, looks up owner's email via admin client, sends Resend notification to owner; skips email in development mode
- `app/[username]/[slug]/access-denied.tsx` — added `RequestAccessForm` below the lock message and `ownerUserId` prop; "Go to dashboard" button demoted to ghost variant
- `app/[username]/[slug]/page.tsx` — passes `ownerUserId` to `AccessDenied`

### Added (Filter bar on list page — 2026-05-09)
- `app/[username]/[slug]/items-grid.tsx` (new) — client component that owns the available-only filter state; renders the item grid and count label; handles the "all claimed" empty state when filter is active
- "Available only" toggle button above the item grid on the gifter/member view; fills green when active, outline when off; count label ("X of Y available") always visible
- `app/[username]/[slug]/member-view.tsx` updated to render `ItemsGrid` instead of the inline items map

### Fixed (Priority select label — 2026-05-09)
- `app/list/[id]/edit/item-form.tsx` — priority select empty option changed from "No priority" to "—"
- `app/list/[id]/edit/item-list.tsx` — same change in the edit item form

### Added (Gift priority ranking — 2026-05-09)
- Priority select field ("Most wanted" / "Would love it" / "Nice to have") on the Add Item sheet (`app/list/[id]/edit/item-form.tsx`) and Edit Item sheet (`app/list/[id]/edit/item-list.tsx`); pre-fills from existing value on edit
- Priority badge on `ItemTile` (`components/item-tile.tsx`): amber for Most wanted, teal for Would love it, muted for Nice to have; hidden when priority is null
- `addItem` and `updateItem` server actions (`lib/actions/items.ts`) now read and persist the `priority` field; validated to `1 | 2 | 3 | null`
- Items sorted by `priority asc nulls last, created_at asc` in both the owner edit view (`app/list/[id]/edit/page.tsx`) and the member/gifter view (`app/[username]/[slug]/page.tsx`)
- `priority` prop wired through `ItemCard` (`app/[username]/[slug]/item-card.tsx`) to `ItemTile`

### Added (Developer tooling — 2026-05-09)
- `.claude/skills/wrap-up/SKILL.md` — `/wrap-up` slash command that runs the full end-of-session ritual: infers completed work from git log, confirms before writing, updates `docs/project_status.md`, `docs/changelog.md`, and `.claude/SESSION_CONTEXT.md`, commits and pushes, then prints a next-session handoff summary

### Changed (Developer tooling — 2026-05-09)
- `CLAUDE.md` Git Etiquette section rewritten: explicit feature workflow (start branch before writing code), branch naming table, commit message type prefix table, pre-commit checklist, PR requirements, PowerShell-compatible branch cleanup
- `CLAUDE.md` — added "After merge — end-of-task cleanup" section covering post-merge pull, branch deletion, docs updates, session context update, and commit sequence

### Added (Universal invite link — 2026-05-09)
- `list_invite_links` table — one row per list, rotatable UUID token, `is_active` flag, RLS-secured
- `lib/actions/invite-links.ts` — `generateInviteLink`, `deactivateInviteLink`, `joinViaLink`, `joinViaLinkForm` server actions
- `app/join/[token]/page.tsx` — public join preview page; handles all edge cases (invalid/deactivated link, owner self-join, already a member, unauthenticated)
- `app/join/[token]/join-button.tsx` — auto-submits on mount so users who just signed up are joined immediately without a manual click
- `app/list/[id]/invites/invite-link-section.tsx` — generate/copy/regenerate/deactivate UI with inline confirmations; all display state derived from `useActionState`, zero `useEffect` setState
- `join` added to reserved usernames in `lib/actions/auth.ts`

### Changed (Invites page UI redesign — 2026-05-09)
- Two-column grid layout: link card and email card side by side on desktop, stacked on mobile
- Link card gets a green left-border accent (`border-l-2 border-l-primary`) to distinguish it from the email card
- Members section shows initials avatar + display name + email (previously raw email only); label changed from "Accepted" to "Members"
- Invite form updated with icon header matching link section style

### Added (V1 Track 5 — reminder emails)
- `app/api/cron/send-reminders/route.ts` — Route Handler secured with `Authorization: Bearer {CRON_SECRET}`; queries all lists with `event_date` at T-14 or T-3 days using the admin Supabase client; sends Resend HTML email to every accepted gifter
- `vercel.json` — registers the cron at `0 14 * * *` (2pm UTC = 9am ET daily)
- HTML reminder email template: same structure as invite email (dark gradient header, green accent, inline CSS); urgency copy and CTA label vary between 14-day and 3-day variants
- `CRON_SECRET` documented in `.env.example`; Vercel auto-generates the value in production

### Fixed (V1 Track 5)
- `types/supabase.ts` — `event_date: string | null` was missing from `lists` Row/Insert/Update (Track 4 type regeneration never committed); added manually

### Added (V1 Track 4 — event dates on lists)
- `formatEventDate` helper (`lib/utils.ts`): formats nullable event dates as relative ("in 3 weeks", "2 weeks ago") + absolute ("Aug 15"), with `isPast` flag for styling
- `EventDateBadge` component (`components/event-date-badge.tsx`): shared badge for displaying event dates on dashboard and member view; greyed text for past dates
- Event date input on list create form (`app/list/new/page.tsx`) — optional native `<input type="date">`
- Separate "Date" button on dashboard list cards (`app/dashboard/lists-section.tsx`) — focused inline form for setting event dates without renaming the list
- Event date display on dashboard ListCards (both "Your lists" and "Gifting on" sections) and member view header
- Dashboard list sorting: closest future dates → farthest future → undated → closest past → farthest past
- Past-event lists rendered at `opacity-60` to de-emphasize completed events

### Changed (V1 Track 4)
- Dashboard list rename form now preserves event_date via hidden input field (renaming no longer clears the date)
- `app/dashboard/lists-section.tsx`: added `datingId` state and separate inline form for date editing; updated "Rename" and "Delete" button handlers to manage three mutually exclusive inline states
- `components/list-card.tsx`: added optional `isPast` prop for greying out past-event cards
- Supabase schema: added nullable `event_date date` column to `lists` table
- `types/supabase.ts`: regenerated to include `event_date: string | null` on lists Row/Insert/Update
### Added (V1 Track 3 — manual product image upload)
- Manual image upload on item add and edit forms (`app/list/[id]/edit/item-form.tsx`, `app/list/[id]/edit/item-list.tsx`) — mirrors the existing profile avatar upload pattern; 2 MB cap, accepts any `image/*`
- Files are stored in the existing `avatars` Supabase Storage bucket at `${userId}/items/${uuid}.${ext}` — no new bucket
- Single shared image slot: scrape-on-paste still auto-fills only when empty; manual upload takes precedence
- `getStorageItemPath` helper in `lib/utils.ts` recognizes URLs that point at our bucket so server cleanup only touches files we own
- Best-effort Storage cleanup in `lib/actions/items.ts`: `updateItem` removes the prior file when `image_url` changes or is cleared; `deleteItem` removes the file when an item is deleted. Scraped/external URLs are skipped.

### Added (V1 Track 2 — image-forward layout)
- Shared `ListCard`, `ItemTile`, `EmptyStateCard` primitives (`components/list-card.tsx`, `components/item-tile.tsx`, `components/empty-state-card.tsx`) — image-forward retail tiles replace row-based UI throughout the app
- shadcn `Sheet` component for slide-in drawers
- Mobile nav (`components/mobile-nav.tsx`) — hamburger button + slide-in sheet menu on mobile; collapses the desktop header on small screens
- Landing page redesign (`app/page.tsx`): hero list mockup that bridges the dark nav into the features grid; image-forward feature cards with mini UI illustrations; new CTA section
- Dashboard now queries up to 4 item images per list to render a 1/2/3/4-up cover collage on each `ListCard`

### Changed (V1 Track 2)
- Dashboard owned-list rows → `ListCard` grid with cover-image collage + inline rename / delete states (`app/dashboard/page.tsx`, `app/dashboard/lists-section.tsx`)
- "Gifting on" section → `ListCard` grid using item images from each shared list
- Member list view → square `ItemTile` grid with claim status overlay; claim/unclaim actions stay inline within each tile (`app/[username]/[slug]/member-view.tsx`, `app/[username]/[slug]/item-card.tsx`)
- Member view header now shows the owner's avatar alongside their name
- Edit-items page → `ItemTile` grid; Edit opens a right-side `Sheet`; Delete uses an inline confirmation in the tile footer (`app/list/[id]/edit/item-list.tsx`)
- Add item modal overlay → `Sheet` drawer (`app/list/[id]/edit/item-form.tsx`)
- Invites page pending/accepted rows → 2-column compact card grids with avatar-style icons (`app/list/[id]/invites/page.tsx`)
- Profile edit form: clothing sizes / name grids now `grid-cols-1 sm:grid-cols-2` for mobile
- Admin tables → `overflow-x-auto` with `min-w-[640px]` so they scroll horizontally on mobile instead of clipping
- App-shell main content padding tightened on mobile; max-width bumped to 1100px to support 4-column tile grids on desktop

### Added
- HTML invite email template (`lib/actions/invites.ts`): branded header, "What is Wishona?" explainer for unfamiliar recipients, "What happens next?" steps, prominent CTA button
- Link metadata auto-fill on item form: paste URL → auto-populates name, price, description, image via `open-graph-scraper` + Amazon regex fallback (`lib/actions/scrape.ts`)
- Item image thumbnails: 40–48px preview images in list edit, gifter view, and dashboard
- Skimlinks affiliate script loaded on all pages (affiliate ID `302378X1790378`)
- Split user names: `first_name` and `last_name` columns replace single `display_name` field; three-level fallback (first + last → first → username)

### Changed
- App rebranded from "Gift Simple" to **Wishona** — updated across all UI, page titles, metadata, and branding
- Custom domain `wishona.com` configured for app and email sending (Resend)
- Profile form: two inputs (first name, last name) replace single display name
- Database: `users.display_name` → `users.first_name` + `users.last_name`
- `UserAvatar` component now takes `firstName` and `lastName` props
- Full UI redesign: Shopify admin–inspired aesthetic (dark navy nav, light gray bg, Shopify green primary, DM Sans)
- Shared `AppShell` component replaces per-page nav/layout
- Item add form converted to modal overlay
- Breadcrumb navigation replaces "← Dashboard" ghost buttons
- Improved empty states, status badges, and error banners throughout
- Design system documented in `docs/design-system.md`

### Fixed
- Dashboard crash on null `display_name` reference after rename refactor — query and types updated to use `first_name`/`last_name`
- Footer branding on landing page also updated to Wishona

## [MVP]

### Added (Admin milestone)
- `app/admin/page.tsx` — admin-only page; checks `ADMIN_USER_ID` server-side; fetches all users (with auth emails via `adminClient.auth.admin.listUsers`) and all lists with item counts
- `app/admin/admin-users.tsx` — users table with inline delete confirmation
- `app/admin/admin-lists.tsx` — lists table with inline delete confirmation
- `lib/actions/admin.ts` — `adminDeleteUser` (via `auth.admin.deleteUser`), `adminDeleteList`; both re-verify admin identity server-side
- `.env.local` — `ADMIN_USER_ID` set to ericp's Supabase user UUID

### Added (Dashboard milestone)
- `app/dashboard/page.tsx` — fetches item counts and pending invite counts per list; passes to `ListsSection`
- `app/dashboard/lists-section.tsx` — displays item count and pending invite count below each list name

### Added (List Page milestone)
- `app/[username]/[slug]/page.tsx` — public list page; looks up owner by username, routes to one of three views based on RLS + auth state; owner redirects to edit page
- `app/[username]/[slug]/member-view.tsx` — gifter view; shows owner profile header (display name, wishlist note, interests, clothing sizes) and items list with claim/unclaim per item
- `app/[username]/[slug]/item-card.tsx` — client component with three-state UI (idle / claiming / unclaiming); partial quantity claiming; shows who else has claimed; reclaim-after-unclaim bug fixed via "store previous renders" pattern on `myPurchase` prop
- `app/[username]/[slug]/access-denied.tsx` — generic access-denied page for non-members/unauthenticated; no request-access CTA (deferred to V2)
- `lib/actions/purchases.ts` — `markPurchased` Server Action (validates availability, enforces owner-cannot-gift invariant); `unmarkPurchased` (deletes own purchase, revalidates path)
- `types/index.ts` — added `PurchaseWithGifter` type
- `types/supabase.ts` — added `quantity` field to `purchases` table types

### Fixed (List Page milestone)
- `lists` "Member read" RLS policy had a self-join bug: the EXISTS subquery compared `list_invites.list_id = list_invites.id` (both columns from the same inner table) instead of `list_invites.list_id = lists.id`. Fixed by applying a migration with explicit table qualifiers. This was the root cause of accepted-invite members seeing "Access restricted" and the dashboard "Gifting on" section appearing empty.
- `app/[username]/[slug]/item-card.tsx` — after unclaiming, `mode` state stayed `'unclaiming'` while `myPurchase` prop became null, hiding both the unclaiming UI and the idle buttons. Fixed by resetting mode to `'idle'` when `myPurchase` transitions to null.
- `app/dashboard/page.tsx` — crash when `invite.list` is null (RLS circular reference on dashboard gifting query); fixed by filtering null lists before rendering.

### Added (Items milestone)
- `lib/actions/items.ts` — `addItem`, `updateItem`, `deleteItem` Server Actions; owner-only auth check; validates name required, price ≥ 0, quantity ≥ 1
- `app/list/[id]/edit/page.tsx` — items management page; fetches list + items server-side; owner-only access (redirects to dashboard otherwise)
- `app/list/[id]/edit/item-form.tsx` — add-item inline form; opens/closes without navigation; controlled state closes form on success using React's "store previous renders" pattern
- `app/list/[id]/edit/item-list.tsx` — item list with per-row edit and delete; edit form uses controlled inputs; delete requires inline confirmation
- `app/dashboard/lists-section.tsx` — added "Items" link per list linking to `/list/[id]/edit`
- `CLAUDE.md` — added rule to fix all browser console errors immediately

### Added (Invites milestone)
- `lib/actions/invites.ts` — `sendInvite`, `acceptInvite`, `acceptInviteForm`, `revokeInvite` Server Actions; 7-day token expiry; dev mode returns invite URL directly instead of sending email
- `app/invite/[token]/page.tsx` — public invite preview page; handles not-found, expired, already-accepted, unauthenticated (create account / log in), and wrong-email states
- `app/invite/[token]/invite-accept.tsx` — client accept form with `useActionState`; email mismatch shown inline before form is rendered
- `app/list/[id]/invites/page.tsx` — invite management page; separated pending (with revoke) and accepted sections
- `app/list/[id]/invites/invite-form.tsx` — send-invite form with dev-mode URL display
- `app/dashboard/page.tsx` — "Gifting on" section showing lists the user has accepted invites to
- `app/dashboard/lists-section.tsx` — "Invites" button per list linking to `/list/[id]/invites`
- `app/signup/page.tsx` + `signup-form.tsx` — `redirectTo` param preserved through signup so invite links survive account creation
- `types/supabase.ts` — generated Supabase DB types
- `types/index.ts` — `ListInvite`, `ListInviteWithList` types derived from generated schema

### Added (Lists milestone)
- `lib/actions/lists.ts` — `createList`, `updateList` (bind pattern), `deleteList` Server Actions; auto-slug generation with numeric de-duplication; duplicate names disambiguated in display name too
- `lib/utils.ts` — `slugify` helper
- `app/list/new/page.tsx` — create list form with `useActionState`
- `app/dashboard/lists-section.tsx` — client component with inline rename and delete-with-confirmation
- `app/dashboard/page.tsx` — fetches owned lists, passes to `ListsSection`
- `types/index.ts` — `Item.url` corrected to `string | null`
- `CLAUDE.md` — added UX Standards section

### Added (Profile milestone)
- `lib/actions/profile.ts` — `updateProfile` Server Action (display name, clothing sizes, interests, note) and `updateAvatarUrl` (saves Storage URL to DB)
- `app/profile/edit/page.tsx` — server page that loads current `users` + `profiles` rows in parallel, passes to form
- `app/profile/edit/profile-form.tsx` — client form with text fields (uncontrolled, `defaultValue`) and avatar upload direct to Supabase Storage
- `components/ui/avatar.tsx` — shadcn Avatar primitive (Base UI)
- `components/ui/user-avatar.tsx` — wrapper with initials fallback; deterministic warm color per user via string hash
- Supabase Storage: `avatars` bucket (public read) with RLS policies allowing users to write only to their own subfolder
- `app/dashboard/page.tsx` — added "Edit profile" link

### Added (Auth milestone)
- `types/index.ts` — TypeScript interfaces for all DB tables (`User`, `Profile`, `List`, `Item`, `ListInvite`, `Purchase`) plus composed types
- `lib/supabase/client.ts` — browser Supabase client via `createBrowserClient` from `@supabase/ssr`
- `lib/supabase/server.ts` — server Supabase client + admin client (service role) via `createServerClient`
- `middleware.ts` — session token refresh on every request; redirects unauthenticated users from `/dashboard`, `/profile`, `/list`, `/admin` to `/login`; redirects authenticated users away from `/login` and `/signup`
- `lib/actions/auth.ts` — `signUp`, `signIn`, `signOut` Server Actions
- `app/signup/page.tsx` — sign-up form (email, password, username)
- `app/login/page.tsx` + `app/login/login-form.tsx` — log-in form, split into server page (reads `searchParams`) and client form
- `app/auth/callback/route.ts` — exchanges Supabase email confirmation code for a session
- `app/dashboard/page.tsx` — placeholder dashboard, protected, shows signed-in email and log-out button
- Supabase schema: `users`, `profiles`, `lists`, `items`, `list_invites`, `purchases` tables with RLS policies and `handle_new_user` trigger
- shadcn/ui components: `Input`, `Label`, `Card`

### Added (Scaffold — previous milestone)
- `project_spec.md` — full product requirements and technical design (data model, RLS policies, Server Actions, routes, file structure)
- `planning.md` — product spec with milestones (MVP / V1 / V2), user flows, competitive analysis, data model, design direction
- `CLAUDE.md` — AI assistant instructions: milestone, architecture rules, design guide, constraints, git etiquette, commands
- `.env.example` — documented environment variables (Supabase, Resend, app URL, admin user ID)
- `.gitignore` — standard Next.js ignore rules
- `.mcp.json` — project-level MCP config (Resend MCP server)
- `docs/architecture.md` — system overview, tech stack, data flow, component structure, key invariants
- `docs/changelog.md` — this file
- `docs/project_status.md` — current milestone tracking and next steps
- Private GitHub repository at `https://github.com/ericproud/wishlist`
- Next.js 16.2.4 app scaffold (TypeScript strict, Tailwind v4, App Router, no `src/` dir)
- Dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `resend`
- shadcn/ui initialized with default `button` component and `lib/utils.ts` helper

### Changed
- `.gitignore` rewritten by `create-next-app`; added `!.env.example` exception so the env template is still committable
