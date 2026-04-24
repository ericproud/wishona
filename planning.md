# Project Spec: Wishlist App

## 1. Overview

A gift registry platform for any occasion — birthdays, weddings, baby showers, holidays, and more. Users can act as **listers** (people who create and manage wishlists) or **gifters** (people who browse a list and purchase gifts). The same person can be a lister on their own lists and a gifter on someone else's.

The core experience: a lister builds a profile and wishlist, shares a link, and gifters use that link to see what to buy and mark items as purchased.

**Monetization (V2):** Affiliate links (Amazon Associates, Skimlinks, etc.) so the platform earns a commission when gifters purchase through product links.

---

## 2. User Roles

### Lister
- Has an account (email + password)
- Has a profile with gifting-relevant info (clothing sizes, interests, personal note)
- Creates and manages wishlists
- Shares their list via a public username-based URL
- Can see which items have been marked purchased

### Gifter
- **Account required to interact** — must be signed in to mark items as purchased
- Anyone with the link can view the list (read-only, no account needed)
- Accesses a list via a shared link
- Browses the lister's profile and items
- Marks items as purchased when logged in

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (profile images, future) |
| Styling | Tailwind CSS |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## 4. Milestones

### MVP — Target: 7 days

The simplest possible working version: one lister, one gifter, one list.

**Auth**
- [ ] Sign up with email + password
- [ ] Log in / log out
- [ ] Redirect to dashboard after login

**Profile**
- [ ] Lister can fill out their profile:
  - Display name
  - Clothing sizes (shirt, pants, shoe size, etc.)
  - Interests & hobbies (free text)
  - Wishlist note (personal message to gifters)

**Wishlist**
- [ ] Lister can add items to their list:
  - Item name (required)
  - Product link / URL (required)
  - Price (optional)
  - Notes/description (optional)
- [ ] Lister can remove items from their list
- [ ] Lister can see which items are marked purchased

**Sharing**
- [ ] Each lister gets a shareable URL: `yourapp.com/{username}`
- [ ] Anyone with the link can view the list without an account (read-only)
- [ ] Gifter must be signed in to mark an item as purchased
- [ ] Signed-in gifter can mark an item as purchased; their account is recorded

---

### V1 — Next iteration after MVP

- Multiple lists per lister (e.g. "Birthday 2025", "Holiday Wishlist")
- Lister can be a gifter on other people's lists
- Gift priority ranking (most wanted → nice to have)
- Gifters can suggest items of their own
- Invite-based list access (optional, per-list setting)
- Lister dashboard: all lists, gifting activity at a glance
- Email notification when an item is marked purchased
- Improved onboarding flow

---

### V2 — Monetization & growth

- Affiliate link rewriting (Amazon Associates, Skimlinks/Impact)
- Confirmed purchase tracking via affiliate callbacks
- Public list mode: items only marked purchased via confirmed affiliate purchase
- Recommendation engine (suggest items based on interests)
- Group buy: multiple gifters can pool toward one expensive item
- List themes: Christmas, Birthday, Wedding, Baby Shower (visual skin per list)

---

## 5. Data Model

```
users
  id            uuid (PK, from Supabase Auth)
  email         text
  username      text (unique, used in URL)
  display_name  text
  created_at    timestamp

profiles
  user_id       uuid (FK → users.id)
  clothing_sizes  jsonb  -- { shirt: "M", pants: "32x30", shoe: "10" }
  interests     text
  wishlist_note text

lists
  id            uuid (PK)
  owner_id      uuid (FK → users.id)
  name          text
  is_public     boolean (default false)
  created_at    timestamp

items
  id            uuid (PK)
  list_id       uuid (FK → lists.id)
  name          text
  url           text
  price         numeric (nullable)
  notes         text (nullable)
  priority      integer (nullable, for V1)
  created_at    timestamp

purchases
  id            uuid (PK)
  item_id       uuid (FK → items.id)
  gifter_id     uuid (FK → users.id)  -- must be signed in
  purchased_at  timestamp
```

---

## 6. Pages & Routes

| Route | Who sees it | Purpose |
|---|---|---|
| `/` | Everyone | Landing page — what the app is, CTA to sign up |
| `/signup` | Unauthenticated | Create an account |
| `/login` | Unauthenticated | Log in |
| `/dashboard` | Lister (authed) | Their lists, profile summary, gifting activity |
| `/profile/edit` | Lister (authed) | Edit clothing sizes, interests, wishlist note |
| `/list/[id]/edit` | Lister (authed) | Add/remove/edit items on a specific list |
| `/[username]` | Everyone (view) / Authed (interact) | View a lister's profile + wishlist; must be signed in to mark purchases |

---

## 7. Design Direction

- **Aesthetic:** Warm and celebratory — soft golds, pinks, creams, gentle gradients. Gift card / greeting card energy.
- **Typography:** Clean, readable; slightly playful without being childish.
- **Layout:** Desktop-first web app. Centered content, max ~900px wide. Responsive CSS from the start so mobile works reasonably but isn't the priority.
- **Future:** Theme system in V2 — each list can have a visual skin (Christmas reds/greens, Birthday confetti, Wedding ivory/gold, etc.).

---

## 8. Monetization

**V2 approach:**
- When a lister adds a product URL, the platform rewrites it to an affiliate link before showing it to gifters
- Providers: Amazon Associates (direct), or an aggregator like **Skimlinks** or **Impact** (supports many retailers automatically)
- Skimlinks is the easiest to start — one script, auto-converts eligible links, no per-retailer setup
- Revenue is small per click/purchase but scales with users

---

## 9. Open Questions

- **App name / domain** — not decided yet. Needs a name before deployment.
- **Email notifications** — recommend adding in V1: notify lister when an item is marked purchased.
- **Username rules** — alphanumeric + hyphens? Minimum length? Reserve common usernames (admin, api, etc.)?
- **Item limit per list** — no limit for now, revisit if abuse becomes an issue.
