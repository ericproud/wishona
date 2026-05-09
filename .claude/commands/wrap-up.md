Perform the end-of-session wrap-up for this project.

$ARGUMENTS

Follow these steps in order — do not skip any:

**Step 1 — Gather context.**
Run `git log --oneline -10` to see recent commits. Review the conversation and any work done this session. If text was provided above after the command, treat it as a hint about what was completed.

**Step 2 — Confirm before writing.**
Tell me what you're about to document (one sentence per doc file) and wait for me to confirm or correct before making any changes.

**Step 3 — Update `docs/project_status.md`.**
Mark any newly completed milestones with ✅ and today's date. Add new milestone rows if the work doesn't fit an existing one.

**Step 4 — Update `docs/changelog.md`.**
Add dated entries under `[Unreleased]` for everything that shipped this session. Group by feature name and date. Include specific file paths for new or changed files.

**Step 5 — Update `.claude/SESSION_CONTEXT.md`.**
- "Last updated" → today's date
- "Last session" → one-line summary of what was completed
- "Current State" → reflect what's done, what's deployed, any pending follow-ups (migrations, type regen, etc.)
- "What's Next" → re-prioritized list for the next session
- "Gotchas" → add any new ones discovered this session

**Step 6 — Commit and push.**
```
git add docs/project_status.md docs/changelog.md .claude/SESSION_CONTEXT.md
git commit -m "chore: update session context"
git push
```

**Step 7 — Print a next-session handoff.**
Write a short paragraph (3–5 sentences) that a fresh Claude instance can read at the start of the next session to orient immediately. Cover: what was built, what's live in production, what's pending (migrations, follow-ups), and the top priority for next time.
