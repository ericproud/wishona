# Wishona

Smart wishlists for meaningful gifts. Create a wishlist, invite the people in your life, and let them give with confidence — no duplicates, no guessing.

**Live:** [wishona.com](https://wishona.com)

---

## What it does

- **Private by default.** Lists are invite-only. Share with exactly who you want.
- **Any store, any item.** Paste a link from anywhere — Amazon, Etsy, a local shop, or no link at all.
- **No duplicate gifts.** Gifters see what's already been claimed so everyone buys something different.
- **Owner blindness.** List owners never see purchase data, gifter identities, or claimed status. The gift stays a surprise.
- **Auto-fill from links.** Paste a product URL into an item and the name, price, image, and description populate automatically.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript (strict)
- **Database / Auth / Storage:** Supabase (Postgres, RLS, email auth, Storage for avatars)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Email:** Resend (invite emails)
- **Affiliate:** Skimlinks
- **Deployment:** Vercel + Supabase

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template and fill in values from Supabase + Resend
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

See [`.env.example`](.env.example) for the full list. You'll need:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` in dev)
- `ADMIN_USER_ID` (Supabase user UUID for the admin)

---

## Common Commands

```bash
npm run dev               # start dev server
npm run build             # production build
npx tsc --noEmit          # type check
npm run lint              # ESLint

# shadcn/ui
npx shadcn@latest add <component>

# Regenerate Supabase types after schema changes
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Project Docs

- [`project_spec.md`](project_spec.md) — full product + technical spec (source of truth)
- [`CLAUDE.md`](CLAUDE.md) — instructions for AI assistants working in this codebase
- [`docs/architecture.md`](docs/architecture.md) — system architecture and data flow
- [`docs/design-system.md`](docs/design-system.md) — visual language and component patterns
- [`docs/project_status.md`](docs/project_status.md) — current milestone tracking
- [`docs/changelog.md`](docs/changelog.md) — release notes

---

## License

Private. All rights reserved.
