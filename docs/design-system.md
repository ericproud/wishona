# Design System

Shopify admin–inspired visual language for Wishona. Clean, professional, and user-focused.

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--nav` | `oklch(0.145 0.015 264)` | Dark navy navigation bar (`#1c1c2e`) |
| `--background` | `oklch(0.965 0 0)` | Page background — light gray (`#f6f6f7`) |
| `--card` | `oklch(1 0 0)` | Card/surface background — white |
| `--foreground` | `oklch(0.18 0.002 264)` | Primary text — near black (`#202223`) |
| `--muted-foreground` | `oklch(0.52 0.005 251)` | Secondary/subdued text (`#6d7175`) |
| `--primary` | `oklch(0.49 0.12 164)` | Shopify green — primary action color (`#008060`) |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary bg — white |
| `--border` | `oklch(0.91 0.003 264)` | Card and element borders (`#e1e3e5`) |
| `--input` | `oklch(0.82 0.003 264)` | Input field borders |
| `--muted` | `oklch(0.945 0 0)` | Subtle background fills |
| `--accent` | `oklch(0.945 0 0)` | Hover states (light gray) |
| `--destructive` | `oklch(0.54 0.21 28)` | Danger/delete actions — red (`#d82c0d`) |
| `--ring` | same as `--primary` | Focus ring color |

### Tailwind utility classes

| Class | Token |
|---|---|
| `bg-nav` | Nav bar background |
| `bg-background` | Page background |
| `bg-card` | Card/surface |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary text |
| `text-primary` | Green accent text |
| `border-border` | Standard border |
| `text-destructive` | Red error/danger text |

---

## Typography

**Font:** DM Sans (Google Fonts)  
A clean, geometric humanist sans-serif. Modern and professional without being generic.

| Role | Class | Size |
|---|---|---|
| Page title | `text-xl font-semibold` | 20px |
| Section heading | `text-sm font-semibold` | 14px |
| Body text | `text-sm` | 14px |
| Caption / label | `text-xs` | 12px |
| Table header | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` | 12px |

---

## Layout

### Page structure
All authenticated pages use the `AppShell` component (`components/app-shell.tsx`).

```
┌─────────────────────────────────────────────┐
│  [Nav bar — bg-nav, h-14]                   │
│  Wishona                   Name · Log out   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  [Page content — bg-background]             │
│  max-w-[960px] mx-auto px-6 py-8           │
│                                             │
│  [Page header]                              │
│  [Cards / tables]                           │
└─────────────────────────────────────────────┘
```

### Max width
- App content: `max-w-[960px]`
- Form-heavy pages (profile, new list): `max-w-2xl` or `max-w-md` within the content area

### Spacing scale
- Page top padding: `py-8` (32px)
- Section gap: `space-y-8` (32px)
- Card padding: `p-5` or `p-6` (20–24px)
- Card row padding: `px-5 py-3.5` (20px/14px)

---

## Components

### Cards

Cards are white surfaces on the light gray page background. Use `border border-border` to define edges.

```tsx
// Standard card
<div className="bg-card border border-border rounded-lg p-5">
  ...
</div>

// Card with rows (lists, tables)
<div className="bg-card border border-border rounded-lg divide-y divide-border">
  <div className="px-5 py-3.5">Row 1</div>
  <div className="px-5 py-3.5">Row 2</div>
</div>
```

### Page Header

Every page starts with a breadcrumb trail and a title:

```tsx
// Breadcrumb
<div className="flex items-center gap-2 mb-6 text-sm">
  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
  <span className="text-border">›</span>
  <span className="text-foreground">List Name</span>
</div>

// Page title + action
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-xl font-semibold text-foreground">Page Title</h1>
    <p className="text-sm text-muted-foreground mt-0.5">Subtitle</p>
  </div>
  <Button size="sm">Primary action</Button>
</div>
```

### Buttons

Uses shadcn/ui `Button`. The `default` variant maps to the primary green.

| Variant | Use |
|---|---|
| `default` | Primary CTA (green background, white text) |
| `outline` | Secondary actions (white bg, border) |
| `ghost` | Tertiary / low-emphasis actions |
| `destructive` | Confirmed destructive actions |

Destructive intent: use `ghost` + `className="text-destructive hover:text-destructive"` for delete buttons that haven't been confirmed yet. Switch to `destructive` variant only when confirming.

### Status badges / inline labels

```tsx
// Success / accepted
<span className="text-xs text-primary font-medium bg-primary/8 px-2 py-0.5 rounded-full">
  Accepted
</span>

// Neutral tag
<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
  ×2
</span>
```

### Inline error/success banners

```tsx
// Error
<div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
  {errorMessage}
</div>

// Success
<div className="bg-primary/8 border border-primary/20 text-primary text-sm rounded-md px-3 py-2">
  Saved.
</div>
```

### Empty states

Every list/table must handle the empty case with a centered message in a card:

```tsx
<div className="bg-card border border-border rounded-lg px-5 py-10 text-center">
  <p className="text-sm text-muted-foreground">No items yet.</p>
  <Link href="/..." className="text-sm text-primary font-medium hover:underline mt-1 inline-block">
    Create the first one →
  </Link>
</div>
```

### Modals / overlays

The item form uses a fixed overlay instead of an inline form:

```tsx
<div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4">
  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-lg">
    ...
  </div>
</div>
```

---

## Navigation

### AppShell nav bar

```
Height: 56px (h-14)
Background: bg-nav (dark navy)
Left: "Wishona" — white, font-semibold, links to /dashboard
Right: display name (links to /profile/edit) + logout button
```

Text colors on nav: `text-white` for logo, `text-white/60 hover:text-white/90` for secondary items.

### Public pages (no auth)

Landing page, login, signup, and invite pages use their own minimal headers with the nav bar pattern but no user menu.

---

## UX Patterns

### Destructive action flow
Never delete immediately. Always show inline confirmation first:
1. First click: show "Delete X? This cannot be undone." + confirm/cancel
2. Confirm click: execute the action

Use `text-destructive` on the initial delete button, switch to `variant="destructive"` only on the confirm button.

### Form feedback
- Error: red banner above the submit button
- Success: green banner in the same position
- Loading: disable the submit button and change its label to "Saving…" / "Creating…"

### Breadcrumb navigation
All non-dashboard pages show a breadcrumb trail (`Dashboard › List Name › Invites`). This replaces the old "← Dashboard" ghost button pattern.

---

## Pages Reference

| Page | Layout | Notes |
|---|---|---|
| `/` | Custom (dark hero) | Landing page, no AppShell |
| `/login` | Centered card | App name above card |
| `/signup` | Centered card | App name above card |
| `/dashboard` | AppShell | Lists section + gifting section |
| `/profile/edit` | AppShell | Avatar card + about + sizes |
| `/list/new` | Custom (minimal nav) | Simple form, no full AppShell needed |
| `/list/[id]/edit` | AppShell | Item list with modal add form |
| `/list/[id]/invites` | AppShell | Invite form + pending/accepted lists |
| `/[username]/[slug]` | Custom nav | Member view: profile card + item rows |
| `/[username]/[slug]` (access denied) | Custom nav | Lock icon + message card |
| `/invite/[token]` | Custom nav | Invite card with accept/auth options |
| `/admin` | AppShell | Users table + lists table |
