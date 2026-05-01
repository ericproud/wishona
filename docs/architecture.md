# Architecture

This document defines the systems architecture, data flow, and component structure for the wishlist web app.

For the full technical spec including RLS policies and Server Actions, see [`project_spec.md`](../project_spec.md) §2.

---

## System Overview

```
Browser
  │
  ├─ Public routes (no auth required)
  │    ├─ /                    — landing page
  │    └─ /invite/[token]      — invite acceptance preview
  │
  ├─ Protected routes (Supabase session required)
  │    ├─ /dashboard
  │    ├─ /profile/edit
  │    ├─ /list/[id]/edit
  │    ├─ /list/[id]/invites
  │    └─ /admin
  │
  └─ Member-gated routes (accepted invite required)
       └─ /[username]/[slug]   — list page (view varies by identity)

Next.js Server
  ├─ Server Components    — data fetching at request time, no client JS
  ├─ Server Actions       — all mutations (add item, mark purchased, etc.)
  └─ Middleware           — reads Supabase session cookie, redirects as needed

Supabase
  ├─ Postgres             — all application data
  ├─ Auth                 — session tokens, user management (email + password)
  ├─ Storage              — profile photos (bucket: avatars, public read)
  └─ RLS Policies         — data access enforced at the DB level
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript (strict mode) |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Email | Resend |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## Data Flow

### Reading data (Server Component)
1. Browser requests a page
2. Middleware reads the Supabase session cookie — redirects if auth is required but missing
3. Server Component calls Supabase with the server client (`lib/supabase/server.ts`)
4. Supabase evaluates RLS policies against `auth.uid()` and returns only allowed rows
5. Server Component renders HTML and sends it to the browser — no data fetching happens client-side

### Writing data (Server Action)
1. User submits a form or clicks a button in a Client Component
2. Client calls a Server Action (`lib/actions/*.ts`)
3. Server Action reads `auth.uid()` from the server-side Supabase session — never trusts client-supplied user IDs
4. Server Action performs the mutation; Supabase enforces RLS on insert/update/delete
5. Server Action calls `revalidatePath()` to bust the cache and returns a result to the client

### Invite token lookup (special case)
- `/invite/[token]` is public — the user may not be authenticated yet
- The token is looked up server-side using the **service role key** (bypasses RLS)
- Only the list name and owner display name are shown in the preview — no sensitive data is exposed
- After the user authenticates, `acceptInvite(token)` runs as a Server Action under their `auth.uid()`

---

## Data Model

```
auth.users (Supabase-managed)
  └── public.users (extends auth.users)
        ├── public.profiles       (1:1, clothing sizes, interests, note, avatar)
        └── public.lists          (1:many, owned lists)
              ├── public.list_invites  (1:many, invite tokens per list)
              ├── public.items         (1:many, items on the list)
              │     └── public.purchases  (1:many, who bought what)
```

Key constraints:
- `lists`: `unique(owner_id, slug)` — slugs are unique per user, not globally
- `list_invites`: `unique(list_id, invited_email)` — one active invite per email per list
- `list_invites.token`: globally unique, used in the invite URL

---

## Component Architecture

```
/app
  layout.tsx                    — root layout (DM Sans, Skimlinks script)
  page.tsx                      — landing page (static)
  /signup/                      — sign-up form (preserves redirectTo for invite flow)
  /login/                       — log-in form (Server + Client split)
  /auth/callback/route.ts       — exchanges Supabase code for session
  /dashboard/                   — owned lists + "Gifting on" section
  /profile/edit/                — first/last name, sizes, interests, note, avatar upload
  /invite/[token]/              — public invite acceptance page
  /list/
    new/                        — create list form
    [id]/edit/                  — items management (add, edit, delete, image, link auto-fill)
    [id]/invites/               — send/revoke invites for a list
  /[username]/[slug]/           — list page (3 view states: owner / member / non-member)
    page.tsx                    — server entry, routes to correct view based on RLS + auth
    member-view.tsx             — gifter view (items + claim status + who claimed what)
    item-card.tsx               — per-item claim/unclaim with partial quantity support
    access-denied.tsx           — non-member fallback
  /admin/                       — admin-gated user/list management

/components
  app-shell.tsx                 — shared nav + page layout for authenticated routes
  /ui/                          — shadcn/ui primitives
    user-avatar.tsx             — wrapper with initials fallback + deterministic warm color

/lib
  supabase/
    client.ts                   — browser Supabase client
    server.ts                   — server Supabase client + admin client
  actions/
    auth.ts                     — signUp, signIn, signOut
    profile.ts                  — updateProfile, updateAvatarUrl
    lists.ts                    — createList, updateList, deleteList
    items.ts                    — addItem, updateItem, deleteItem
    purchases.ts                — markPurchased, unmarkPurchased
    invites.ts                  — sendInvite, acceptInvite, revokeInvite
    scrape.ts                   — scrapeItemUrl (open-graph-scraper + Amazon fallback)
    admin.ts                    — adminDeleteUser, adminDeleteList
  utils.ts                      — slugify, cn helpers

/types
  index.ts                      — shared TypeScript types (composed)
  supabase.ts                   — auto-generated from Supabase schema
```

---

## Key Invariants

**Gift surprise is sacred.**
The list owner must never see purchase data, gifter identities, or claimed/available status on their own list. This is enforced by an RLS policy on `purchases` that explicitly excludes the list owner — it is not a UI-only restriction.

**RLS is the security boundary.**
All data access rules are enforced at the DB level via RLS policies. The UI is a convenience layer on top of that, not the enforcement layer.

**Server Actions own all mutations.**
No API routes are used for data mutations. All writes go through Server Actions in `/lib/actions/` with `auth.uid()` validated server-side.

**Service role key is server-only.**
`SUPABASE_SERVICE_ROLE_KEY` is used in exactly one place: the server-side token lookup in `/invite/[token]`. It must never appear in any file that runs in the browser or is passed to a Client Component.
