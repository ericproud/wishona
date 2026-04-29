# Project Status

Tracks milestones, what has been completed, and what comes next. Updated after each major milestone.

---

## Current Phase

**Admin complete — MVP feature-complete. Next: deploy to Vercel.**

All milestones are done. Next target: deploy to Vercel and connect a production domain.

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
- [x] Add item (name, URL, price, quantity, notes)
- [x] Edit and delete items
- [ ] Quantity-aware purchase tracking

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

## Immediate Next Steps

1. Deploy to Vercel — connect domain, set production env vars

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
| Items | ✅ Complete | |
| List page (3-view) | ✅ Complete | |
| Dashboard | ✅ Complete | |
| Admin | ✅ Complete | |
| Deploy to Vercel | ⬜ Not started | Needs app name / domain first |
| MVP complete | ⬜ Not started | |
