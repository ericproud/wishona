# Changelog

All notable changes to this project will be documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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
