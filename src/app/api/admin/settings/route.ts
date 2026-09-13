import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings, password } = body;

    const adminPass = process.env.ADMIN_PASSWORD || "genc2026";
    if (password !== adminPass) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Settings object required" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
