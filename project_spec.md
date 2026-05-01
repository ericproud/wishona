# Project Spec: Wishona

---

# Part 1: Product Requirements

## 1.1 Problem Statement

People want to give good gifts, but they constantly guess wrong. And people who want specific things have no clean, occasion-agnostic way to share what they want — complete with the context (sizes, interests, price range) that makes gifting easy.

Existing tools are broken in different ways:
- **Amazon Wishlist** — locked to one retailer, gifter UX is clunky, no personal context
- **Zola / The Knot** — wedding-only, complex setup, couples-only framing
- **Google Doc / Notes** — no purchase coordination, no profile, no product links
- **Generic wishlist apps** — sparse, no gifting context, no occasion flexibility

**This app's position:** A personal gifting profile that works for any occasion, any retailer, with just enough context to make buying the right thing easy — and built clean enough that people actually use it.

---

## 1.2 Target Users

### The User (one type, two contexts)

There is only one type of user account. Every user can create lists (making them the **list owner** for those lists) and can also gift on anyone else's list (making them a **gifter** for those lists). The distinction is always relative to a specific list, not to the person.

**Persona:** 18–35, comfortable sharing a link, uses Amazon but wishes they could link anything. Has experienced the frustration of receiving a gift that missed the mark — and the equal frustration of not knowing what to buy for someone.

**As a list owner:** wants people to know what to get them, but has zero visibility into purchase activity — no statuses, no names, no counts. The gift is a surprise.

**As a gifter:** wants to see what's still available, understand the person's context (sizes, interests), and mark something as claimed without a lot of friction.

---

## 1.3 Jobs To Be Done

| Job | Context | Current solution |
|---|---|---|
| "I want people to know what to get me for my birthday" | As list owner | Texting a list, Amazon wishlist |
| "I want to buy something they'll actually use" | As gifter | Asking around, guessing |
| "I want to avoid buying a duplicate gift" | As gifter | Group chats, asking the host |
| "I want to include my sizes so people don't have to ask" | As list owner | Repeating themselves every time |
| "I want to link things from any store" | As list owner | Multiple lists on different platforms |

---

## 1.4 Competitive Differentiation

| Feature | This App | Amazon Wishlist | Zola | Google Doc |
|---|---|---|---|---|
| Any occasion | ✅ | ❌ | ❌ (weddings) | ✅ |
| Any retailer | ✅ | ❌ | Partial | ✅ |
| Gifting profile (sizes, interests) | ✅ | ❌ | Partial | ❌ |
| Purchase coordination | ✅ | ✅ | ✅ | ❌ |
| Invite-based access (private by default) | ✅ | ❌ | Partial | ❌ |
| Clean gifter UX | ✅ | ❌ | Partial | ❌ |
| Quantity support | ✅ | ✅ | ✅ | ❌ |
| Affiliate revenue (V2) | ✅ | N/A | N/A | ❌ |

**Defensibility over time:** The platform becomes more useful as more people are on it (gifters already have accounts) and as the affiliate link layer matures. The profile data (sizes, interests) creates a reason to keep the account up to date.

---

## 1.5 User Flows

### Flow 1: User creates a list and invites people
1. Land on `/` → click "Get started"
2. Sign up with email + password → redirected to `/dashboard`
3. Prompted to set username and fill profile (display name, photo, clothing sizes, interests, note)
4. Create a named list (e.g. "Birthday 2025")
5. Add items: name, URL, price (optional), quantity, notes
6. Invite people by entering their email addresses → each receives an invite email with a unique link
7. Can create additional lists and manage invites per list at any time

### Flow 2: Invitee accepts an invite and gifts
1. Invitee receives email with a unique link: `yourapp.com/invite/{token}`
2. Clicks link → arrives at `/invite/{token}` page, can preview the list name and owner
3a. If they don't have an account → sign-up form; on completion their new account is linked to the invite
3b. If they already have an account → log-in form; on completion their existing account is linked to the invite
4. Redirected to the list page — now a confirmed member, can see all items and gifting activity
5. Sees who has claimed what (e.g. "Alex is getting the Air Fryer") — prevents duplicate purchases
6. Can mark available items as purchased
7. The list owner sees none of this — their view never shows purchase status or gifter identities

### Flow 3: User checks their own list
1. Log in → `/dashboard`
2. See all owned lists with item counts and pending invite counts
3. Their own list pages show items only — no purchase status, no gifter information
4. The gift is a surprise until it arrives

---

## 1.6 Feature Requirements

### MVP — ✅ Complete (Deployed)

**Auth**
- [x] Sign up (email + password)
- [x] Log in / log out
- [x] Username chosen on signup (unique, alphanumeric + hyphens, 3–20 chars)
- [x] Reserve system usernames: `admin`, `api`, `login`, `signup`, `dashboard`, `profile`

**Profile**
- [x] First name + last name (replaced original `display_name` field)
- [x] Profile photo (upload via Supabase Storage)
- [x] Clothing sizes (structured: shirt, pants, shoe, dress — all optional)
- [x] Interests & hobbies (free text)
- [x] Wishlist note (personal message to gifters, free text)

**Lists**
- [x] Create a named list (name required, slug auto-generated from name)
- [x] Rename or delete a list
- [x] Multiple lists per user — no hard limit for MVP
- [x] Lists are private by default — only accessible to invited members

**Invites**
- [x] List owner enters one or more email addresses to invite
- [x] System sends each invitee an email with a unique invite link: `yourapp.com/invite/{token}`
- [x] Invitee clicks link → shown a preview (list name, owner) and prompted to sign up or log in
- [x] After auth: account is linked to the invite and they gain access to the list
- [x] If an existing account's email matches the invite email, linking is automatic on login
- [x] List owner can see pending vs. accepted invites and revoke pending ones
- [x] Invite tokens expire after 7 days

**Items**
- [x] Add item: name (required), URL (optional), price (optional), quantity (required, default 1), notes (optional), image (auto-fetched from URL)
- [x] Edit item
- [x] Delete item
- [x] Items have a quantity; multiple purchases allowed up to that quantity
- [x] Multiple purchases of same item allowed (quantity-based — e.g. 2 of 3 bought)
- [x] Auto-fill on URL paste (open-graph-scraper + Amazon regex fallback)

**Invite Page (`/invite/{token}`)**
- [x] Publicly accessible (no auth required to reach this page)
- [x] Shows list owner's name and list name as a preview
- [x] Presents sign-up and log-in options
- [x] On auth: links account to invite, marks invite accepted, redirects to the list
- [x] If token is expired or already used: shows a clear error message

**List Page (`/{username}/{list-slug}`) — access controlled by invite membership**

*Unauthenticated or non-member:* shown an access denied page

*Accepted member (logged in, NOT the list owner):*
- [x] Sees list owner's profile and all items
- [x] Sees who has claimed what (e.g. "Alex is getting the Air Fryer")
- [x] Can mark available items as purchased (partial quantity supported)
- [x] Cannot mark items that are fully claimed

*List owner (viewing their own list page):*
- [x] Redirects to `/list/[id]/edit` — items management view
- [x] Owner page shows items only — zero purchase data, no availability status
- [x] Completely blind to gifting activity to preserve the surprise

**Dashboard**
- [x] See all owned lists with item counts and pending/accepted invite counts
- [x] Links to manage invites per list (send new, view pending, revoke)
- [x] Links to edit each list (items)
- [x] No gifting activity or purchase data shown anywhere on the owned-lists section
- [x] "Gifting on" section — lists where the user has an accepted invite (not their own lists); shows list name and owner's name; links to the list page

**Admin**
- [x] Protected `/admin` route (gated by `ADMIN_USER_ID` env var)
- [x] View all users, lists, and item counts
- [x] Delete users / lists with inline confirmation

**Post-MVP additions (delivered)**
- [x] Full UI redesign — Shopify admin-inspired aesthetic, DM Sans, dark nav, green primary
- [x] App rebranded from "Wishlist" → "Gift Simple" → **Wishona**
- [x] Custom domain: wishona.com
- [x] Skimlinks affiliate integration on all pages
- [x] Redesigned invite email with HTML template explaining the platform

---

### V1 — In Progress (1–2 week sprint)

Goals locked in: **more signups** + **deeper engagement post-signup**. The core experience needs to be visually tighter and more mobile-friendly. Track-level breakdown lives in `docs/project_status.md`.

**In scope:**
- **Image-forward layout redesign** across all pages (dashboard, list pages, profile, invites, admin, landing). Pinterest/Etsy-style grid replaces the uniform vertical card list. Same palette (dark nav, green accent), same DM Sans, just better layout and mobile responsiveness.
- **Pending/disabled states** on every async mutation (deletes, revokes, uploads) so users get visual feedback within ~100ms.
- **Profile-edit redirect:** new users who finish profile setup land on the dashboard, not back on the form.
- **Manual product image upload** alongside the existing URL auto-scrape. Reuses the `avatars` Storage bucket (path `${userId}/items/...`) and mirrors the avatar upload pattern. Manual upload takes precedence over auto-scrape.
- **Event dates on lists** (optional `event_date date` column). Displayed on dashboard and member view as relative ("in 3 weeks") or absolute ("Aug 15") depending on proximity.
- **Reminder emails** sent via Vercel Cron + Resend to all accepted gifters at T-14 and T-3 days before a list's `event_date`. Reuses the existing invite email HTML template style.

**Deferred (originally V1, now V1.5 / V2):**
- Anonymous purchase toggle (owner-facing setting to hide gifter identities from each other).
- Gift priority ranking (drag to reorder, or explicit priority tag).
- Members can suggest items to a list they're gifting on.
- "All claimed" notification email to list owner.
- Improved onboarding with progress steps (the redirect-to-profile-edit on signup is enough for now).
- Better dashboard with full gifting activity feed.
- ~~Item images~~ — already shipped in post-MVP work; manual upload added in V1 above.

---

### V2 — Monetization & growth

- Affiliate link rewriting (Amazon Associates + Skimlinks for other retailers)
- Confirmed purchase tracking via affiliate callbacks
- Public list mode: purchases require affiliate confirmation
- **Filter bar on list page:** members can toggle between "All items" and "Available only" (not yet fully claimed). Deferred from MVP.
- **Request access CTA on access-denied page:** non-members can enter their email to notify the list owner. Deferred from MVP — currently a dead end.
- List themes (Christmas, Birthday, Wedding, Baby Shower visual skins)
- Recommendation engine (based on interests)
- Group buy: split cost of one item across multiple gifters
- Analytics dashboard for listers (views, clicks, purchases)

---

## 1.7 Success Metrics

| Metric | MVP target |
|---|---|
| Signed-up users | 10+ |
| Lists with at least 1 item | 10+ |
| Items marked purchased | 1+ (real gift, real person) |
| Users who have gifted on someone else's list | 3+ |

---

## 1.8 Go-To-Market (MVP)

1. Build it and use it yourself — create your own list, share with family
2. Share with 5–10 close friends/family asking for honest feedback
3. If it works: post in relevant communities (r/weddingplanning, r/gifts, r/productivity)
4. Longer term: SEO — list pages are SSR'd and indexable; target "wishlist app", "gift registry any occasion"

---

# Part 2: Technical Design

## 2.1 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16+ (App Router) | SSR + Server Actions + file-based routing; industry standard |
| Language | TypeScript | Type safety, internship-impressive, catches bugs early |
| Database | Supabase (Postgres) | Managed DB + auth + storage + RLS in one place |
| Auth | Supabase Auth | Email/password built in, session management, integrates with RLS |
| Storage | Supabase Storage | Profile photo uploads |
| Styling | Tailwind CSS | Utility-first, fast to build with |
| Components | shadcn/ui | Accessible, well-designed, you own the code, very common in the industry |
| Deployment | Vercel (frontend) + Supabase (backend) | Free tier, zero-config Next.js deployment |

---

## 2.2 Architecture Overview

```
Browser
  │
  ├─ Public routes (no auth required)
  │    └─ /invite/[token]        — invite acceptance preview, sign up or log in
  │
  ├─ Protected routes (require Supabase session)
  │    ├─ /dashboard
  │    ├─ /profile/edit
  │    ├─ /list/[id]/edit
  │    ├─ /list/[id]/invites
  │    └─ /admin
  │
  └─ Member-gated routes (accepted invite required, enforced in Server Component not middleware)
       └─ /[username]/[slug]     — list page, view varies by viewer identity

Next.js Server
  ├─ Server Components — data fetching, SSR
  ├─ Server Actions — all mutations (add item, mark purchased, etc.)
  └─ Middleware — redirect unauthenticated users away from protected routes

Supabase
  ├─ Postgres — all app data
  ├─ Auth — session tokens, user management
  ├─ Storage — profile photos (bucket: avatars)
  └─ RLS Policies — enforce ownership at DB level
```

---

## 2.3 Data Model

```sql
-- Extends Supabase's auth.users table
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  username    text not null unique,
  first_name  text,
  last_name   text,
  created_at  timestamptz default now()
);

create table public.profiles (
  user_id       uuid primary key references public.users(id) on delete cascade,
  avatar_url    text,
  clothing_sizes jsonb,     -- { shirt: "M", pants: "32x30", shoe: "10", dress: "6" }
  interests     text,
  wishlist_note text
);

create table public.lists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.users(id) on delete cascade,
  name        text not null,
  slug        text not null,              -- url-safe version of name, e.g. "birthday-2025"
  is_public   boolean default false,   -- lists are private by default
  created_at  timestamptz default now(),
  unique (owner_id, slug)                 -- slugs unique per user, not globally
);

create table public.items (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid not null references public.lists(id) on delete cascade,
  name        text not null,
  url         text,                -- optional; not all items have a product link
  image_url   text,                -- optional; auto-fetched from URL or manually added
  price       numeric(10,2),
  quantity    integer not null default 1,
  notes       text,
  priority    integer,         -- for V1
  created_at  timestamptz default now()
);

create table public.list_invites (
  id             uuid primary key default gen_random_uuid(),
  list_id        uuid not null references public.lists(id) on delete cascade,
  invited_by     uuid not null references public.users(id),
  invited_email  text not null,
  token          text not null unique,     -- used in /invite/{token} URL
  user_id        uuid references public.users(id), -- set when accepted
  accepted_at    timestamptz,              -- null = pending
  expires_at     timestamptz not null,     -- created_at + 7 days
  created_at     timestamptz default now(),
  unique (list_id, invited_email)          -- one active invite per email per list
);

create table public.purchases (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.items(id) on delete cascade,
  gifter_id    uuid not null references public.users(id) on delete cascade,
  quantity     integer not null default 1,    -- supports partial-quantity claims
  purchased_at timestamptz default now()
);
```

---

## 2.4 Supabase RLS Policies

```sql
-- users: anyone can read, only you can update your own row
alter table public.users enable row level security;
create policy "Public read" on public.users for select using (true);
create policy "Own update" on public.users for update using (auth.uid() = id);

-- profiles: public read, owner write
alter table public.profiles enable row level security;
create policy "Public read" on public.profiles for select using (true);
create policy "Owner write" on public.profiles for all using (auth.uid() = user_id);

-- lists: readable by owner or accepted invite members only
alter table public.lists enable row level security;
create policy "Member read" on public.lists for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.list_invites
      where list_id = id
        and user_id = auth.uid()
        and accepted_at is not null
    )
  );
create policy "Owner write" on public.lists for all using (auth.uid() = owner_id);

-- items: readable by list owner or accepted invite members
alter table public.items enable row level security;
create policy "Member read" on public.items for select
  using (
    auth.uid() = (select owner_id from public.lists where id = list_id)
    or exists (
      select 1 from public.list_invites
      where list_id = items.list_id
        and user_id = auth.uid()
        and accepted_at is not null
    )
  );
create policy "Owner write" on public.items for all
  using (auth.uid() = (select owner_id from public.lists where id = list_id));

-- list_invites: owner can read/write their list's invites; token lookup handled server-side
alter table public.list_invites enable row level security;
create policy "Owner manage" on public.list_invites for all
  using (auth.uid() = invited_by);
create policy "Invitee read own" on public.list_invites for select
  using (auth.uid() = user_id);

-- purchases: authed users can insert their own; any authed user can read EXCEPT the list owner
-- list owners are intentionally excluded to preserve the gift surprise
alter table public.purchases enable row level security;
create policy "Authed insert" on public.purchases for insert with check (auth.uid() = gifter_id);
create policy "Gifter read" on public.purchases for select
  using (
    auth.uid() is not null
    and auth.uid() != (
      select l.owner_id from public.lists l
      join public.items i on i.list_id = l.id
      where i.id = item_id
    )
  );
```

---

## 2.5 Key Server Actions

```
// Lists
createList({ name })        -- auto-generates slug from name, creates for auth.uid()
updateList(listId, { name }) -- also regenerates slug
deleteList(listId)

// Invites
sendInvite(listId, email)   -- creates invite record + sends email via Resend
acceptInvite(token)         -- links auth.uid() to invite, sets accepted_at
revokeInvite(inviteId)      -- deletes a pending invite

// Items
addItem(listId, { name, url, image_url, price, quantity, notes })
updateItem(itemId, fields)
deleteItem(itemId)
scrapeItemUrl(url)          -- server action: fetches OG metadata for auto-fill

// Purchases
markPurchased(itemId, quantity)  -- creates a purchases row for auth.uid() (partial-quantity supported)
unmarkPurchased(purchaseId)      -- deletes own purchase

// Profile
updateProfile(fields)       -- clothing_sizes, interests, wishlist_note, avatar_url
updateUser(fields)          -- first_name, last_name, username

// Admin
adminDeleteUser(userId)
adminDeleteList(listId)
```

---

## 2.6 Pages & Routes

| Route | Access | Rendering | Purpose |
|---|---|---|---|
| `/` | Public | Static | Landing page, CTA to sign up |
| `/signup` | Unauthed only | Client | Email + password sign-up, choose username |
| `/login` | Unauthed only | Client | Email + password login |
| `/invite/[token]` | Public | Server + Client | Invite acceptance — preview list, sign up or log in |
| `/dashboard` | Authed | Server | Owned lists + invite counts (no purchase data) |
| `/profile/edit` | Authed | Server + Client | Edit profile info + photo |
| `/list/new` | Authed | Client | Create a new list |
| `/list/[id]/edit` | Authed | Server + Client | Add/edit/remove items on a specific list |
| `/list/[id]/invites` | Authed (owner only) | Server + Client | Manage invites — send, view pending, revoke |
| `/[username]/[slug]` | Accepted members only | SSR | List page — view varies by viewer identity (see §1.6) |
| `/admin` | Hardcoded admin only | Server | View + manage users/lists |

---

## 2.7 File Structure

```
/app
  layout.tsx              -- root layout, Supabase session provider
  page.tsx                -- landing page
  /signup/page.tsx
  /login/page.tsx
  /dashboard/page.tsx
  /profile/edit/page.tsx
  /invite/
    [token]/page.tsx      -- invite acceptance page (public)
  /list/
    new/page.tsx          -- create a new list
    [id]/edit/page.tsx    -- manage items on a specific list
    [id]/invites/page.tsx -- manage invites for a list
  /[username]/
    [slug]/page.tsx       -- SSR list page (members only, view varies by identity)
  /admin/page.tsx

/components
  /ui/                    -- shadcn/ui primitives (do not edit directly)
    user-avatar.tsx       -- UserAvatar: initials fallback with deterministic warm color
  ItemCard.tsx            -- (planned)
  PurchaseButton.tsx      -- (planned)
  ItemForm.tsx            -- (planned)
  FilterBar.tsx           -- (planned)

/lib
  supabase/
    client.ts             -- browser Supabase client
    server.ts             -- server Supabase client (for Server Components + Actions)
  actions/
    auth.ts               -- signUp, signIn, signOut
    profile.ts            -- updateProfile, updateAvatarUrl
    items.ts              -- (planned)
    purchases.ts          -- (planned)
    invites.ts            -- (planned)
  utils.ts

/types
  index.ts                -- shared TypeScript types
```

---

## 2.8 Auth & Session Strategy

- Supabase Auth handles sessions via cookies (using `@supabase/ssr` package)
- Next.js middleware (`middleware.ts`) reads the cookie and redirects unauthenticated requests to `/login` for protected routes
- `/{username}/[slug]` is member-gated — the **page Server Component** (not middleware) queries `list_invites` to check if `auth.uid()` is an accepted member; non-members are shown an access-denied page inline. Middleware only handles simple path-prefix auth redirects and cannot efficiently query per-list membership on every request.
- `/invite/{token}` is public — the token is looked up server-side using the Supabase service role key (bypasses RLS), so the invite can be read before the user is authenticated
- After auth on the invite page: `acceptInvite(token)` Server Action links `auth.uid()` to the invite row and sets `accepted_at`, then middleware allows access to the list
- Invite token matching on login: if an existing user's email matches the `invited_email` on a pending invite, the invite can be auto-accepted on login

---

## 2.9 Profile Photo Upload Flow

1. User selects a file in `/profile/edit`
2. Client uploads directly to Supabase Storage bucket `avatars/{user_id}/avatar.jpg`
3. Server Action updates `profiles.avatar_url` with the public URL
4. Supabase Storage bucket is set to public read

---

## 2.10 Notes & Decisions

| Topic | Decision |
|---|---|
| App name / domain | **Not yet decided** — required before Vercel deploy |
| Email (invite sending) | Resend — free tier, `onboarding@resend.dev` sandbox for dev; production domain TBD |
| Email notifications (purchase activity) | V1 only — notify list owner when all items are claimed |
| Username reservation | Enforced in `signUp` Server Action: `admin`, `api`, `login`, `signup`, `dashboard`, `profile`, `list`, `assets`, `static`, `invite` |
| `is_public` on lists | Defaults to `false` — all lists are private; the `is_public` field is reserved for a V2 public list mode |
| `/{username}` public profile page | **Not in MVP** — the route conflicts with `/[username]/[slug]` and adds scope. Deferred to V1. |
| Member-gating for list pages | Enforced in the page Server Component, not middleware. Middleware only handles simple path-prefix redirects. |
| Error monitoring | Add Sentry free tier before going live (post-MVP) |
| Analytics | Vercel Analytics — add at deploy time |
