# GenC Leaderboard - Metrics & House Cup Specification

## 1. Design Philosophy
Most social media leaderboards rank by cumulative vanity numbers (follower counts, lifetime views), which discourages beginners and rewards early starters. 

The GenC Leaderboard rewards **creative momentum, posting discipline, and content breakthroughs**, enabling a day-one creator to outperform a 100K-follower creator on the leaderboard.

---

## 2. Individual Creator Metrics

### A. Adaptive Consistency & Cadence Score
Creators select a realistic cadence goal when registered:
* `DAILY` (7 posts / week)
* `ALTERNATE` (3–4 posts / week)
* `BIWEEKLY` (2 posts / week)
* `WEEKLY` (1 post / week)

#### Calculation:
For a rolling 7-day or 14-day evaluation window:
$$\text{Expected Posts} = \text{Target Rate} \times \frac{\text{Window Days}}{7}$$
$$\text{Execution Ratio} = \min\left(1.0, \frac{\text{Actual Posts in Window}}{\text{Expected Posts}}\right)$$

#### Pacing Regularity Penalty ($\sigma_{\Delta t}$):
Posting 4 reels on Sunday and none for 13 days is penalized compared to posting every 48 hours:
$$\text{Regularity Multiplier} = \frac{1}{1 + \text{std\_dev}(\text{interval between posts in days})}$$
$$\text{Consistency Score} = 100 \times \text{Execution Ratio} \times \text{Regularity Multiplier}$$

---

### B. View Momentum (2nd Order Metric / Slope)
Measures whether a creator's audience engagement is accelerating across their last $N$ reels (default $N=5$).

Let $(x_i, y_i)$ be (post index $i$, normalized views $\tilde{V}_i$), where:
$$\tilde{V}_i = \frac{V_i}{\text{Median Views across last 30 days}}$$

Using ordinary least squares linear regression:
$$\text{Slope } m = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}$$
* Positive $m$ indicates accelerating reach.
* High $m$ indicates a creator whose format has found traction.

---

### C. Breakout Ratio (Outlier Detection)
Detects viral or highly resonated content relative to the creator's personal normal baseline:
$$\text{Breakout Ratio} = \frac{\max(V_{\text{last 14d}})}{\max(100, \text{Median}(V_{\text{last 30d}}))}$$
* **Threshold (Default: $\ge 3.0\times$):** Unlocks the **Outlier of the Week** badge.
* Helps the cohort identify which videos achieved outsized distribution so everyone can break down the hook, script, and editing craft.

---

### D. Engagement Density
Evaluates how actively the audience is participating:
$$\text{Engagement Density} = \frac{\text{Comments} \times 2 + \text{Likes}}{\max(1, \text{Views})} \times 100$$
Evaluated on recent posts to reward depth of community connection.

---

## 3. The House Cup Mechanics

Creators are assigned to balanced "Houses". The House Score combines collective consistency, median growth, and individual breakthrough bonuses.

### Aggregate House Scoring Formula:
$$\text{House Points} = \text{Base Points} + \text{Momentum Bonus} + \text{Breakout Bonus} + \text{Discipline Bonus}$$

Where:
1. **Discipline Bonus:**
   $$\sum_{c \in \text{House}} (\text{Consistency Score}_c \times W_{\text{consistency}})$$
   Every creator who hits their target cadence contributes directly to the House.
2. **Momentum Points:**
   $$\text{Median}_{c \in \text{House}}(\text{Slope}_c) \times W_{\text{momentum}}$$
   Using the median prevents one viral outlier from carrying an inactive house.
3. **Breakout Bounty:**
   $$N_{\text{breakouts}} \times \text{Points per Breakout}$$
   Each verified breakout post adds bonus points to the team.

---

## 4. Configurable Admin Settings

All scoring weights and thresholds are stored in the database and editable via the Admin UI without code redeployment:

| Parameter Key | Default Value | Description |
| :--- | :--- | :--- |
| `window_days` | `14` | Rolling days evaluated for consistency and medians |
| `min_posts_for_slope` | `3` | Minimum posts required to compute view velocity |
| `slope_sample_size` | `5` | Number of recent posts used for slope regression |
| `breakout_threshold` | `3.0` | Multiplier over median to trigger breakout bonus |
| `breakout_house_points` | `25` | House points awarded per member breakout |
| `consistency_house_weight` | `0.5` | Weight multiplier for individual consistency scores |
| `momentum_house_weight` | `10.0` | Weight multiplier for median house slope |
