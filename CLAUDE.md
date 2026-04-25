# CLAUDE.md

Instructions for working in this codebase.

---

## Important Files

| File                                 | Purpose                                                        |
| ------------------------------------ | -------------------------------------------------------------- |
| [`project_spec.md`](project_spec.md) | Full product requirements + technical design — source of truth |
| [`planning.md`](planning.md)         | Rough early notes, kept for historical context                 |
| [`.env.example`](.env.example)       | All required environment variables                             |

---

## Current Milestone

**MVP — 7-day target.** Full checklist in `project_spec.md §1.6`.

Build order:

1. Auth — sign up, log in, log out, username selection
2. Profile — display name, photo, clothing sizes, interests, note
3. Lists — create, rename, delete
4. Invites — send by email (Resend), accept via token link, revoke
5. Items — add, edit, delete, quantity
6. List page — three-view logic: owner / accepted member / non-member
7. Dashboard — owned lists, item counts, invite counts
8. Admin — hardcoded to `ADMIN_USER_ID`, view/delete users and lists

---

## Architecture

- **Framework:** Next.js 14+ App Router, TypeScript
- **Database / Auth / Storage:** Supabase (Postgres, email+password auth, Storage for avatars)
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend — invite emails only for MVP
- **Deployment:** Vercel + Supabase

**Mutations use Server Actions only** — no API routes for data mutations. Keep actions in `/lib/actions/` grouped by domain: `items.ts`, `invites.ts`, `purchases.ts`, `profile.ts`.

**RLS is the security boundary.** Write the RLS policy first, then build the UI on top of it. Never rely on the UI alone to restrict data.

**Critical invariant — gift surprise:** The list owner must never see purchase data, gifter identities, or claimed/available status on their own list. This is enforced at the DB level by an RLS policy on `purchases` that explicitly excludes the list owner. Do not add any workaround or shortcut at the UI layer that would reveal this data to the owner. See `project_spec.md §2.4` for the exact policy.

Full technical design: `project_spec.md §2.1–2.9`.

---

## Design & Style

- **Aesthetic:** Warm and celebratory — soft golds, pinks, creams, gentle gradients. Gift card energy.
- **Layout:** Desktop-first. Centered content, max ~900px wide. Use responsive CSS from the start so mobile is reasonable, but it is not the priority for MVP.
- **Components:** Use shadcn/ui before writing anything custom. Add components with `npx shadcn@latest add <component>`.
- **Tailwind only** — no custom CSS files unless there is no other way.
- **No emojis** in the UI unless the design explicitly calls for it.

---

## UX Standards

Before writing or committing any UI change, ask: **would a real user understand this without explanation?**

- **Write for users, not developers.** Never expose technical concepts in the UI — no slugs, no UUIDs, no database field names, no internal jargon. If a detail only matters to the code, hide it.
- **Every piece of UI copy should be purposeful.** Labels, hints, placeholders, and error messages must earn their place. If a hint doesn't help the user make a decision, remove it.
- **Think through the full interaction.** For every new UI element: what does the empty state look like? What does an error look like? What happens on success? All three must be handled before the feature is considered done.
- **Destructive actions need confirmation.** Any delete or irreversible action must have an inline confirmation step — not a browser `window.confirm()` dialog.
- **Feedback must be immediate.** If a user clicks a button and nothing visibly changes within ~100ms, add a loading/pending state.
- **Never make the user feel lost.** Every protected page needs a clear way back (dashboard link) and a way out (log out). Apply this to every new page.

---

## Product & UX Guidelines

- **One user type.** There is no "lister" vs "gifter" account — these are contextual roles relative to a specific list. Don't create separate account types or separate flows for them.
- **Invite-only access.** Lists are private by default. Without an accepted invite, a visitor sees an access-denied page — not a 404.
- **Owner blindness.** A list owner viewing their own list page sees items only. No purchase status, no availability indicators, no gifter names. Preserve this in every UI state (loading, empty, error).
- **Member coordination.** Accepted members who are not the owner can see who claimed what. This is intentional — it prevents duplicate gifts.
- **Auth required to act.** Anyone with an invite token can view the invite preview page unauthenticated. But marking an item purchased requires a logged-in account.

---

## Constraints & Policies

### Security

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never reference it in any file that runs in the browser or is passed to a Client Component.
- Never commit `.env`, `.env.local`, or any file with real credentials. `.env.example` (with placeholder values) is the only env file that gets committed.
- Server Actions must validate `auth.uid()` server-side. Never trust a user ID sent from the client.

### Dependencies

- Do not add packages without a clear reason. The stack is intentionally minimal.
- Use `@supabase/ssr` — not the legacy `@supabase/auth-helpers-nextjs`.
- shadcn/ui is the component library. Do not install other UI/component libraries alongside it.

### Code Quality

- TypeScript strict mode. No `any` types.
- No `console.log` in committed code.
- No unused imports or variables.
- Types live in `/types/index.ts`.
- Keep components small. If a component needs more than ~150 lines it probably needs to be split.

---

## Git Etiquette

- **Never push directly to `main`.** All changes go through a feature branch and PR.
- **Branch naming:** `feature/short-description`, `fix/short-description`, `chore/short-description`
- **Commit messages:** Imperative mood, lowercase, concise — e.g. `add invite acceptance page`, `fix purchase RLS policy`
- **One concern per PR.** Don't bundle unrelated changes.
- **Repo:** `https://github.com/ericproud/wishlist` (private)

### When to commit

Commit at every logical stopping point — don't let work pile up. Good commit moments:
- A feature or sub-feature is complete and tested in the browser
- A bug is fixed and verified
- A refactor is done and type-checks pass
- Before switching to a different concern

### Pre-commit checklist (run in order, fix before committing)

```bash
npx tsc --noEmit   # must be zero errors
npm run lint       # must be zero errors (warnings OK)
npm run build      # run before PRs, not necessarily every commit
```

Never commit with TypeScript errors or lint errors. If the build fails, fix it before opening the PR.

---

## Common Commands

```bash
# Development
npm run dev               # start dev server at localhost:3000

# Build & type check
npm run build             # production build
npx tsc --noEmit          # type check only
npm run lint              # ESLint

# shadcn/ui
npx shadcn@latest add <component>

# Supabase local dev (if configured)
npx supabase start        # start local Supabase stack
npx supabase db push      # push schema migrations
npx supabase gen types typescript --local > types/supabase.ts  # regenerate DB types
```

---

## Testing

No test suite in MVP — manual testing only.

Before marking any feature complete:

- Test the happy path end-to-end in the browser
- Test at least one edge/error case (expired token, duplicate purchase, unauthorized list access)
- For the list page specifically: verify all three viewer identities manually (owner, accepted member, unauthenticated/non-member)
- Type checking and linting verify code correctness — they do not verify feature correctness. Always test in the browser.
- Update `docs/project_status.md` and `docs/changelog.md` after completing each milestone before opening a PR.
