# Changelog

All notable changes to this project will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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
