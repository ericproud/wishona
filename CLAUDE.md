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

## Current Status

**MVP complete and shipped.** V1 in progress — see [`docs/project_status.md`](docs/project_status.md) for milestones and current work.

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
- **Fix all browser console errors immediately.** Console errors — including framework and library warnings — are bugs. Do not defer them. Every error left in place accumulates into technical debt that becomes harder to unwind later.

---

## Git Etiquette

- **Never push directly to `main`.** All changes go through a feature branch and PR.
- **Branch naming:** `feature/short-description`, `fix/short-description`, `chore/short-description`
- **Commit messages:** Imperative mood, lowercase, concise — e.g. `add invite acceptance page`, `fix purchase RLS policy`
- **One PR per milestone.** Each milestone in the build order gets its own branch and PR. Do not bundle multiple milestones into one branch.
- **Repo:** `https://github.com/ericproud/wishlist` (private)

### Milestone completion — do this automatically, without being asked

When a milestone is fully tested and working:

1. Update `docs/project_status.md` and `docs/changelog.md`
2. Run the pre-commit checklist and fix any issues
3. Commit the doc updates
4. Push the branch and open a PR on GitHub
5. Tell the user the PR is ready to merge, then immediately create the next feature branch and continue

Do not wait for the user to ask. A clean git history is a project requirement.

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

### Branch hygiene — clean up automatically, without being asked

Whenever you start a session, switch branches, or finish a milestone, prune merged branches so the local repo stays in sync with GitHub. Do this on your own — don't wait for the user to ask.

Standard cleanup sequence (run when the working tree is clean and the current branch is not the one being deleted):

```bash
git fetch --prune origin                  # drops remote-tracking refs whose upstream is gone
git checkout main && git pull --ff-only   # fast-forward main to origin/main
git branch --merged main | grep -vE '^\*|^\s*main$' | xargs -r git branch -d
```

Rules:
- Only delete branches that are fully merged into `main` (use `-d`, never `-D`, unless the user explicitly approves a force-delete).
- Never delete a branch with uncommitted or unpushed work — verify with `git status` and `git log origin/<branch>..HEAD` first.
- If the current branch is the one to delete, switch to `main` first.
- If something looks unexpected (unknown branches, divergent history), stop and ask before deleting.

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

---

## Documentation & Memory

### When to write a patterns file

Create a memory patterns file (in `.claude/projects/.../memory/`) **only if the pattern will be reused or has hidden gotchas**. Use this heuristic: *would documenting this save 10+ minutes of re-reading code in a future conversation?*

**Write a patterns file when:**

- **Reusable architecture** — the pattern applies to multiple features (e.g., hidden form fields for partial updates, local-date parsing for timezone safety, mutually exclusive UI states)
- **Non-obvious gotchas** — subtle issues future work will hit (UTC midnight shifts, FormData coercion, RLS circular references)
- **Cross-cutting concerns** — patterns that span multiple files or become a project convention
- **Decision context** — why approach A was chosen over B, so you don't re-debate it later

**Examples to skip:**

- One-off bug fixes ("fix dropdown z-index clash") — no pattern, just a fix
- Straightforward feature additions with no novel patterns — just work normally
- Incremental improvements to existing features — captured in changelog is enough
- Things already in CLAUDE.md or design-system.md — use those instead

### What goes in a patterns file

Structure: name, description, problem statement, solution with code example, "Apply to:" (where else this pattern fits), and any warnings.

Example structure (from `track_4_patterns.md`):
```markdown
## Pattern Name

**Problem:** Why this pattern was needed.

**Solution:** How to solve it (with code snippet).

**Apply to:** Other features or contexts where this pattern helps.

**Why:** The reasoning behind the approach.
```

### Updating memory

Keep memory entries current — if a pattern changes or a decision is reversed, update or delete the entry. Stale memory is worse than no memory.

Add pointers to patterns files in `MEMORY.md` (the index), not the content itself — keep the index under 200 lines so it stays loaded in context.
