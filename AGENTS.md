# AGENTS.md - GenC Leaderboard

## Project Overview
This repository contains the GenC Cohort Leaderboard application. It tracks, normalizes, and compares creator progress across Instagram Reels and YouTube Shorts/Videos using 2nd-order momentum metrics, posting discipline, and team-based House Cup standings.

---

## Technical Stack
- **Framework:** Next.js 14 (App Router, TypeScript, Tailwind CSS, Lucide icons)
- **Database:** PostgreSQL with Prisma ORM
- **Deployment Target 1 (Current):** Google Cloud Run (Container) + Google Cloud SQL (PostgreSQL) + Cloud Scheduler
- **Deployment Target 2 (Post Nov 15 Migration):** Vercel / Railway + Supabase / Neon
- **Data Scraping:**
  - YouTube: Official YouTube Data API v3
  - Instagram: Apify Instagram Actor (Cloud) + Local Playwright provider (Fallback)
- **Notifications:** Discord Webhook (Leaderboard summaries & Breakout alerts)

---

## Directory Structure
```
genc_leaderboard/
├── docs/                     # Specifications and architectural decisions
│   ├── ARCHITECTURE.md       # Full system design and portability strategy
│   ├── METRICS_SPEC.md       # 2nd-order mathematical formulations & House Cup rules
│   └── SMOKE_TEST.md         # Scraping tests & data extraction logs
├── prisma/                   # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── app/                  # Next.js App Router (Pages, Layout, API Routes)
│   ├── components/           # UI Components (Leaderboard, HouseCard, AdminModal)
│   ├── lib/                  # Business logic
│   │   ├── scoring.ts        # Slope regression, consistency, and house points
│   │   ├── scrapers/         # YouTube & Instagram data ingestion providers
│   │   └── discord.ts        # Webhook embed formatting
│   └── types/                # Shared TypeScript interfaces
├── scripts/                  # Standalone verification, smoke test & sync scripts
├── .env.example
├── package.json
└── README.md
```

---

## Development Guidelines
1. **Always use parameterized config:** Never hardcode scoring multipliers or thresholds in application code. Fetch from `Settings` table with fallback defaults.
2. **Never expose secrets:** `APIFY_TOKEN`, `YOUTUBE_API_KEY`, `ADMIN_PASSWORD`, and `DATABASE_URL` must remain in `.env` or GCP Secret Manager.
3. **Idempotent Syncs:** Ingestion runs must be idempotent. If a sync fails midway, it should safely resume or re-run without creating duplicate video snapshots.
