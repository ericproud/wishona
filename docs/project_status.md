# Project Status

Tracks milestones, what has been completed, and what comes next. Updated after each major milestone.

---

## Current Phase

**Auth complete — starting Profile next.**

Sign up, log in, log out, and middleware are all working. Supabase schema, RLS policies, and the `public.users` trigger are applied. Next target: profile editing (display name, clothing sizes, interests, note, avatar upload).

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
- [ ] Edit display name, clothing sizes, interests, wishlist note
- [ ] Profile photo upload (Supabase Storage)

### Lists
- [ ] Create a named list (auto-generates slug)
- [ ] Rename and delete a list
- [ ] Multiple lists per user

### Invites
- [ ] Send invite by email via Resend
- [ ] Unique token link: `/invite/[token]`
- [ ] Invite acceptance page (public, previews list + prompts auth)
- [ ] Account linked to invite on sign-up or log-in
- [ ] Owner can view pending/accepted invites and revoke pending ones
- [ ] Tokens expire after 7 days

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

### Admin (`/admin`)
- [ ] Gated to `ADMIN_USER_ID`
- [ ] View all users and lists
- [ ] Delete users and lists

---

## Immediate Next Steps

1. Apply the Supabase schema from `project_spec.md §2.3` in the Supabase SQL editor
2. Apply the RLS policies from `project_spec.md §2.4`
3. Regenerate DB types: `npx supabase gen types typescript --project-id <ref> > types/supabase.ts`
4. Create Supabase client helpers: `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server components + actions)
5. Add middleware to refresh Supabase sessions and gate protected routes
6. Begin Auth milestone — sign up, log in, log out, username selection

---

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| Planning & spec | ✅ Complete | `project_spec.md` is the source of truth |
| Repo & tooling setup | ✅ Complete | GitHub repo live, docs scaffolded |
| App scaffolding | ✅ Complete | Next 16, React 19, Tailwind v4, shadcn/ui initialized |
| Auth (sign up / log in) | ⬜ Not started | |
| Profile | ⬜ Not started | |
| Lists + Items | ⬜ Not started | |
| Invites + email | ⬜ Not started | |
| List page (3-view) | ⬜ Not started | Highest complexity feature |
| Dashboard | ⬜ Not started | |
| Admin | ⬜ Not started | |
| Deploy to Vercel | ⬜ Not started | Needs app name / domain first |
| MVP complete | ⬜ Not started | |
