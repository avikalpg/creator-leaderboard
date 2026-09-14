import os, sys, subprocess

def main():
    env_path = os.path.join(os.path.dirname(__file__), "../.env")
    if not os.path.exists(env_path):
        print("Error: .env not found")
        sys.exit(1)

    cron_secret = ""
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("CRON_SECRET="):
                cron_secret = line.split("=", 1)[1].strip().strip("\"'")

    if not cron_secret:
        print("Error: CRON_SECRET not found in .env")
        sys.exit(1)

    job_name = "creator-leaderboard-sync"
    service_url = "https://creator-leaderboard-zxynuqtcfa-uc.a.run.app/api/sync"
    region = "us-central1"
    project = "avikalps-experiments"

    # Check if job already exists
    check_cmd = [
        "gcloud", "scheduler", "jobs", "describe", job_name,
        "--location", region,
        "--project", project
    ]
    res = subprocess.run(check_cmd, capture_output=True, text=True)

    if res.returncode == 0:
        print(f"Job '{job_name}' exists. Updating...")
        cmd = [
            "gcloud", "scheduler", "jobs", "update", "http", job_name,
            "--schedule=0 */6 * * *",
            f"--uri={service_url}?key={cron_secret}",
            "--http-method=POST",
            f"--headers=Content-Type=application/json,Authorization=Bearer {cron_secret}",
            "--time-zone=Asia/Kolkata",
            "--location", region,
            "--project", project
        ]
    else:
        print(f"Creating job '{job_name}'...")
        cmd = [
            "gcloud", "scheduler", "jobs", "create", "http", job_name,
            "--schedule=0 */6 * * *",
            f"--uri={service_url}?key={cron_secret}",
            "--http-method=POST",
            f"--headers=Content-Type=application/json,Authorization=Bearer {cron_secret}",
            "--time-zone=Asia/Kolkata",
            "--location", region,
            "--project", project,
            "--description=Automatic 6-hour sync for GenC Creator Leaderboard"
        ]

    exec_res = subprocess.run(cmd, capture_output=True, text=True)
    if exec_res.returncode != 0:
        print("Failed to configure Cloud Scheduler job:")
        print(exec_res.stderr)
        sys.exit(exec_res.returncode)

    print(f"SUCCESS: Cloud Scheduler job '{job_name}' configured successfully!")
    print("Schedule: 0 */6 * * * (Every 6 hours, Asia/Kolkata)")

if __name__ == "__main__":
    main()
