# GenC Leaderboard - Architecture & System Design

## 1. Overview
The GenC Leaderboard is a community dashboard designed for creators in the GenC cohort. It measures and compares performance based on **2nd-order metrics, cadence consistency, and momentum** rather than sheer follower size, leveling the playing field for new and experienced creators alike.

---

## 2. Core Pillars
1. **Fair & Motivational Metrics:** Focuses on cadence regularity, view velocity (slope), breakout ratios, and engagement depth.
2. **Dual Platform Tracking:** Ingests data from Instagram Reels and YouTube Shorts/Videos.
3. **House Cup Dynamics:** Aggregates creator scores into competitive "Houses" with configurable admin point weights.
4. **Automated Scheduled Sync:** Runs every 6 to 12 hours via cron.
5. **Discord Webhook Notifications:** Pushes periodic leaderboard standings and instant alerts for breakout reels.
6. **Zero Lock-in Cloud Architecture:** Runs on Google Cloud (Cloud Run + Cloud SQL) to leverage startup credits until mid-November, with a clean migration path to Vercel/Supabase in under 5 minutes.

---

## 3. High-Level Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │             Admin / Creators                 │
                       │   (Add Handles, Tweak Weights, View Board)   │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js 14 Web Application                         │
│                                                                             │
│  ┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐  │
│  │   Leaderboard UI     │  │   House Cup Standings │  │   Admin Panel    │  │
│  │ (Sort by Slope/Break)│  │ (Weighted Aggregates) │  │(Config & Creators│  │
│  └──────────────────────┘  └───────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 API Routes & Cron Sync Endpoint                       │  │
│  │  - GET /api/leaderboard                                               │  │
│  │  - POST /api/creators                                                 │  │
│  │  - POST /api/admin/settings                                           │  │
│  │  - POST /api/cron/sync (Protected by CRON_SECRET)                     │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌─────────────────────────┐                           ┌─────────────────────────┐
│     PostgreSQL DB       │                           │     Scraper Engine      │
│     (Prisma ORM)        │                           │                         │
│ - Creators & Houses     │                           │ ┌─────────────────────┐ │
│ - Video Snapshots       │                           │ │ YouTube Data API v3 │ │
│ - Daily Metrics History │                           │ └─────────────────────┘ │
│ - Configurable Settings │                           │ ┌─────────────────────┐ │
└─────────────────────────┘                           │ │ Instagram Provider  │ │
                                                      │ │  - Apify (Cloud)    │ │
                                                      │ │  - Playwright(Local)│ │
                                                      │ └─────────────────────┘ │
                                                      └────────────┬────────────┘
                                                                   │
                                                                   ▼
                                                      ┌─────────────────────────┐
                                                      │     Discord Webhook     │
                                                      │  (Sync Embeds & Alerts) │
                                                      └─────────────────────────┘
```

---

## 4. Portability & Cloud Strategy

### Phase 1: Google Cloud Platform (Until Nov 15, 2026)
* **App Runtime:** Next.js container deployed on **Google Cloud Run** (scales to 0 when idle, minimal credit consumption).
* **Database:** **Google Cloud SQL (PostgreSQL)** micro-instance.
* **Cron Trigger:** **Google Cloud Scheduler** hitting `POST /api/cron/sync` every 6 or 12 hours with HTTP Bearer authentication.
* **Cost:** 100% paid by existing $16K GCP startup credits.

### Phase 2: Post-Nov 15 Migration (Vercel / Supabase)
* **App Runtime:** Push to GitHub $\rightarrow$ linked to **Vercel** or **Railway** (free hobby tier).
* **Database:** Export schema and data via standard `pg_dump`, restore into **Supabase** or **Neon** free tier PostgreSQL, and update `DATABASE_URL`.
* **Cron Trigger:** Use **Vercel Cron** or a simple **GitHub Actions workflow** scheduled on cron (`0 */6 * * *`).
* **Migration Downtime:** < 5 minutes, 0 code rewrites.

---

## 5. Ingestion Providers & Anti-Bot Strategy

### YouTube
* Standard **YouTube Data API v3** using a server API key.
* Fetches channel metadata, recent videos/shorts, view counts, like counts, and published dates.
* Daily quota consumption is minimal (~100-200 units out of 10,000 free daily units).

### Instagram
Meta blocks unauthenticated datacenter IPs (GCP, AWS, Azure, Vercel). To handle this without ongoing maintenance:
1. **Primary Cloud Provider (Apify API):**
   - Free tier includes $5/month forever.
   - For 50 accounts scraped 2x daily, cost is ~$1.20/month $\rightarrow$ effectively **$0/month**.
   - Handles residential IP proxy rotation and Instagram DOM updates automatically.
2. **Local Fallback Provider (Playwright / Direct):**
   - Headless browser executing with residential network headers.
   - Ideal for manual on-demand triggers or local testing without consuming external credits.
