import { NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync";

export const maxDuration = 300; // 5 minutes max for full cohort scrape

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const keyParam = searchParams.get("key");

    const cronSecret = process.env.CRON_SECRET || "genc-secret-cron-token";
    const adminPass = process.env.ADMIN_PASSWORD || "genc2026";

    const isCronAuthorized =
      authHeader === `Bearer ${cronSecret}` || keyParam === cronSecret;

    let bodyPassword = "";
    try {
      const body = await req.json();
      bodyPassword = body.password;
    } catch {
      // no json body
    }

    const isAdminAuthorized = bodyPassword === adminPass;

    if (!isCronAuthorized && !isAdminAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Triggering cohort synchronization...");
    const result = await runFullSync();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Manual/Cron sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
