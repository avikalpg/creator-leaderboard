import os, sys, subprocess

def main():
    env_path = os.path.join(os.path.dirname(__file__), "../.env")
    if not os.path.exists(env_path):
        print("Error: .env not found")
        sys.exit(1)

    config = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                config[k.strip()] = v.strip().strip("\"'")

    db_url = config.get("POSTGRES_DATABASE_URL") or config.get("DATABASE_URL")
    if not db_url or not db_url.startswith("postgres"):
        print("Error: Valid POSTGRES_DATABASE_URL not found in .env")
        sys.exit(1)

    env_vars = {
        "DB_TYPE": "postgres",
        "DATABASE_URL": db_url,
        "POSTGRES_DATABASE_URL": db_url,
        "SCRAPER_MODE": "apify",
        "APIFY_API_KEY": config.get("APIFY_API_KEY", ""),
        "YOUTUBE_API_KEY": config.get("YOUTUBE_API_KEY", ""),
        "ADMIN_PASSWORD": config.get("ADMIN_PASSWORD", "genc2026"),
        "CRON_SECRET": config.get("CRON_SECRET", "genc-secret-cron-token"),
    }

    if config.get("DISCORD_WEBHOOK_URL"):
        env_vars["DISCORD_WEBHOOK_URL"] = config["DISCORD_WEBHOOK_URL"]

    temp_yaml = "/tmp/cloudrun-env.yaml"
    with open(temp_yaml, "w") as f:
        for k, v in env_vars.items():
            escaped = str(v).replace('"', '\\"')
            f.write(f'{k}: "{escaped}"\n')

    cmd = [
        "gcloud", "run", "deploy", "creator-leaderboard",
        "--source", ".",
        "--region", "us-central1",
        "--project", "avikalps-experiments",
        "--service-account", "cloud-run-sa@avikalps-experiments.iam.gserviceaccount.com",
        "--allow-unauthenticated",
        f"--env-vars-file={temp_yaml}",
        "--format=value(status.url)",
        "--quiet"
    ]

    print("Deploying container to Google Cloud Run (us-central1)...")
    try:
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = proc.communicate()
        if proc.returncode != 0:
            print("Deployment Failed:")
            print(stderr)
            sys.exit(proc.returncode)
        
        url = stdout.strip()
        print("\nSUCCESS! Deployed to Google Cloud Run.")
        print(f"Service URL: {url}")
    finally:
        if os.path.exists(temp_yaml):
            os.remove(temp_yaml)

if __name__ == "__main__":
    main()
