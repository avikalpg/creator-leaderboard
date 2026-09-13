# GenC Leaderboard - Scraping Smoke Test Findings

## Date: September 14, 2026
## Test Scope
Verification of live data extraction from public Instagram profiles across 6 cohort members without requiring authentication, login credentials, or OAuth tokens.

---

## 1. Results Summary

| Handle | Creator Name | Followers | Total Recent Reels Extracted | Sample Views (Latest to Oldest) | Breakout / Outliers Detected |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `contrarian.techie` | Avikalp | 44 | 11 | 147, 283, 239, 606, 150, 483, 399, 391, 187, 216, 267 | **606 views** (~2.5x personal median of 267) |
| `chaiandcontext` | Sneha | 5,217 | 12 | 3.2K, 1.6K, 603, 16.8K, 7.6K, 2.8K, 4.6K, 58.7K, 17.3K | **58.7K views** (~18x personal baseline!) |
| `thejeniljain` | Jenil Jain | 14 | 1 | 349 | Day-1 creator, 1 strong first reel |
| `nehamuchhhh` | Neha Prabhu | 4,075 | 12 | 54.6K, 2.4K, 11.9K, 2.1K, 2.4K | **54.6K views** (pinned/top) & **11.9K** |
| `testaheron` | Taher Lakdawala | 1,234 | 12 | 2.5K, 2.4K, 10.8K, 29.9K, 6.2K | **29.9K views** (~12x baseline) |
| `missionmultilingual` | Mission Multilingual | 14 | 9 | 222, 237, 1.5K, 230, 254 | **1,569 views** (~6.8x personal baseline) |

---

## 2. Key Discoveries & Technical Takeaways

1. **Reels Grid (`/reels/`) View Counts:**
   - Instagram renders the exact view count directly on the video cards in the `/reels/` tab DOM.
   - Hovering/card DOM nodes also carry likes and comment counts without opening the individual post modals.
2. **Follower Base Irrelevance (Validating our Core Premise):**
   - Look at `missionmultilingual`: with **only 14 followers**, one of their reels achieved **1,569 views** (a **6.8x breakout**!).
   - In a standard follower-based leaderboard, this creator would be sitting at the bottom unnoticed. In our system, they earn the **Breakout Outlier Badge** and huge House momentum points.
   - Look at `contrarian.techie`: with **44 followers**, several reels reached 400-600 views consistently.
3. **Dual Provider Strategy:**
   - **Local Headless Engine:** Works cleanly from residential IPs using headless browser automation.
   - **Cloud Scheduler (Apify):** Once deployed to Cloud Run, we route through Apify's API so Google Cloud datacenter IPs are never blacklisted by Meta.
