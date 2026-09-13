# Creator Leaderboard 🏆

A fair, momentum-driven creator leaderboard for cohorts, mastermind communities, and creator programs.

Unlike traditional leaderboards that celebrate vanity numbers (total followers, lifetime views), the **Creator Leaderboard** rewards **posting consistency, creative breakthroughs (outliers), and view acceleration (slope)**, leveling the playing field for day-one creators alongside experienced creators.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/avikalpg/creator-leaderboard.git
cd creator-leaderboard
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## 🗄️ Database Configuration (Explicit Dual-Mode)

This project supports **both local SQLite and cloud PostgreSQL** with zero schema-editing friction. You can configure both URLs in your `.env` and toggle between them using `DB_TYPE`:

```env
# Toggle between "sqlite" (local) and "postgres" (cloud)
DB_TYPE="sqlite"

# SQLite configuration (used when DB_TYPE="sqlite")
SQLITE_DATABASE_URL="file:./dev.db"

# PostgreSQL configuration (used when DB_TYPE="postgres", e.g. NeonDB / Supabase / Cloud SQL)
POSTGRES_DATABASE_URL="postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require"
```

### How Database Switching Works
When you run `npm run dev`, `npm run build`, or `npm run db:push`:
1. `scripts/prepare-schema.js` reads `DB_TYPE`.
2. It sets the active datasource provider (`sqlite` or `postgresql`) in `prisma/schema.prisma`.
3. It syncs the active connection string.
4. Prisma client connects to the selected database at runtime.

### Initializing Tables
- **For local SQLite:** Set `DB_TYPE="sqlite"`, then run:
  ```bash
  npm run db:push
  npm run db:seed
  ```
- **For cloud PostgreSQL (e.g. NeonDB):** Set `DB_TYPE="postgres"`, then run:
  ```bash
  npm run db:push
  npm run db:seed
  ```

---

## 🕷️ Scraper Modes (`SCRAPER_MODE`)

You can control how Instagram reels data is collected using `SCRAPER_MODE` in `.env`:

| Mode | Description | Best For | Requirements |
| :--- | :--- | :--- | :--- |
| **`auto`** *(Default)* | Tries Apify cloud actor; falls back to local browser if empty. | Development & production resilience | `APIFY_API_KEY` (optional) |
| **`local`** | Uses local headless browser automation from your residential IP. | 100% free local runs, zero cloud costs | Local Chrome/Chromium |
| **`apify`** | Calls Apify's managed cloud actor via API. | Docker / Cloud Run / Vercel cloud deployments | `APIFY_API_KEY` ($5/mo free tier) |

### YouTube Ingestion
Add your `YOUTUBE_API_KEY` to `.env` (obtained from Google Cloud Console with YouTube Data API v3 enabled). If tracking Instagram-only creators, this can be left blank.

---

## 📊 Core Features & Metrics

- 📈 **View Velocity Slope ($m$):** Ordinary least squares linear regression over the last 5 posts normalized against the creator's personal 30-day baseline. Positive slope rewards accelerating reach.
- 🎯 **Cadence Regularity & Discipline (0–100%):** Evaluates actual posts vs. committed posting targets (`DAILY`, `ALTERNATE`, `BIWEEKLY`, `WEEKLY`) with standard deviation penalties for uneven burstiness.
- ⚡ **Breakout Ratio (Outlier Detection):** Detects posts that surge $\ge 3\times$ over a creator's median views, unlocking the **Breakout Badge** so the cohort can study the hook and script.
- 🏰 **The House Cup:** Groups creators into teams with aggregate point formulas (discipline + median momentum + breakout bonuses).
- ⚙️ **In-App Admin Panel (`passphrase: genc2026`):**
  - Add new creators and assign them to Houses.
  - Live configuration of evaluation windows, slope sample sizes, and point weights.
  - Manual "Sync Now" button.
- 🤖 **Automated Cron Sync:** Triggered via `POST /api/sync?key=CRON_SECRET` every 6–12 hours (compatible with Google Cloud Scheduler, Vercel Cron, or GitHub Actions).
- 💬 **Discord Webhooks:** Automatically broadcasts leaderboard standings and breakout notifications to your community chat.

---

## 🐳 Docker & Cloud Deployment

### Docker Container
A multi-stage production Dockerfile is included:
```bash
docker build -t creator-leaderboard .
docker run -p 8080:8080 --env-file .env creator-leaderboard
```

### Deploying to Google Cloud Run
```bash
gcloud run deploy creator-leaderboard \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_TYPE="postgres",POSTGRES_DATABASE_URL="postgresql://..."
```

---

## 📚 Technical Documentation
- [System Architecture](docs/ARCHITECTURE.md)
- [Metrics Math & Scoring Spec](docs/METRICS_SPEC.md)
- [Smoke Test & Extraction Findings](docs/SMOKE_TEST.md)
