# Project Status

Tracks milestones, what has been completed, and what comes next. Updated after each major milestone.

---

## Current Phase

**Invites complete — starting Items next.**

Auth, Profile, Lists, and Invites milestones are done. Owners can send invites by email (Resend, dev mode returns URL directly), view pending/accepted invites, and revoke pending ones. Invitees visit a token link, see a preview of the list and owner, and accept after authenticating. Tokens expire after 7 days. Next target: add, edit, delete items with quantity tracking.

**Installed versions:** Next.js 16.2.4, React 19.2.4, Tailwind v4, shadcn/ui, `@supabase/ssr`, `@supabase/supabase-js`, `resend`.

---

## MVP Checklist

Target: 7 days from first line of code. Full requirements in `project_spec.md §1.6`.

### Setup
- [x] Project spec written (`project_spec.md`)
- [x] GitHub repository created (`ericproud/wishlist`, private)
- [x] `CLAUDE.md`, `.env.example`, and docs scaffolded
- [x] Next.js app scaffolded (Next 16, TypeScript, Tailwind v4, App Router)
- [x] Core dependencies installed (`@supabase/ssr`, `@supabase/supabase-js`, `resend`, `shadcn/ui`)
- [x] Supabase project created, keys in `.env.local`
- [x] Supabase schema applied, RLS policies in place
- [x] Resend account set up (using `onboarding@resend.dev` sandbox sender for now)
- [ ] Resend production sending domain verified
- [ ] Vercel project connected to GitHub repo

### Auth
- [x] Sign up (email + password + username)
- [x] Log in / log out
- [x] Middleware redirecting unauthenticated users from protected routes

### Profile
- [x] Edit display name, clothing sizes, interests, wishlist note
- [x] Profile photo upload (Supabase Storage)

### Lists
- [x] Create a named list (auto-generates slug)
- [x] Rename and delete a list
- [x] Multiple lists per user

### Invites
- [x] Send invite by email via Resend
- [x] Unique token link: `/invite/[token]`
- [x] Invite acceptance page (public, previews list + prompts auth)
- [x] Account linked to invite on sign-up or log-in
- [x] Owner can view pending/accepted invites and revoke pending ones
- [x] Tokens expire after 7 days

### Items
- [ ] Add item (name, URL, price, quantity, notes)
- [ ] Edit and delete items
- [ ] Quantity-aware purchase tracking

### List Page (`/[username]/[slug]`)
- [ ] Owner view — items only, zero purchase data
- [ ] Member view — items + who claimed what + filter bar + mark purchased
- [ ] Non-member / unauthenticated — access denied page

### Dashboard
- [ ] All owned lists with item counts and invite counts
- [ ] Links to manage invites and edit items per list
- [ ] "Gifting on" section — lists where user has an accepted invite

### Admin (`/admin`)
- [ ] Gated to `ADMIN_USER_ID`
- [ ] View all users and lists
- [ ] Delete users and lists

---

## Immediate Next Steps

1. Items milestone — add, edit, delete, quantity
2. List page milestone — three-view logic (owner / member / non-member)
3. Dashboard milestone — item counts, invite counts, "gifting on" section

---

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| Planning & spec | ✅ Complete | `project_spec.md` is the source of truth |
| Repo & tooling setup | ✅ Complete | GitHub repo live, docs scaffolded |
| App scaffolding | ✅ Complete | Next 16, React 19, Tailwind v4, shadcn/ui initialized |
| Auth (sign up / log in) | ✅ Complete | |
| Profile | ✅ Complete | |
| Lists | ✅ Complete | |
| Invites + email | ✅ Complete | |
| List page (3-view) | ⬜ Not started | Highest complexity feature |
| Dashboard | ⬜ Not started | |
| Admin | ⬜ Not started | |
| Deploy to Vercel | ⬜ Not started | Needs app name / domain first |
| MVP complete | ⬜ Not started | |
