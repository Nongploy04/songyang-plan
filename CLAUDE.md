@AGENTS.md

<!-- BEGIN:songyang-production-topology -->
### Production topology
- Primary UI: Next.js App Router on Vercel at `https://songyang-plan.vercel.app`.
- Vercel-only: one canonical production app; historical snapshots are test fixtures, never deployment targets.
- Vercel Hobby releases use the exact pushed SHA from a git-free stage per workspace-root `AGENTS.md`.
- Production search policy: `noindex,nofollow`; `/robots.txt` disallows all crawlers per ADR 0006.
<!-- END:songyang-production-topology -->
