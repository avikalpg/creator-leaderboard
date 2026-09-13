import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, houseName, instagramHandle, youtubeHandle, targetCadence, bio, password } = body;

    const adminPass = process.env.ADMIN_PASSWORD || "genc2026";
    if (password !== adminPass) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    if (!name || (!instagramHandle && !youtubeHandle)) {
      return NextResponse.json(
        { error: "Name and at least one social handle (Instagram or YouTube) are required." },
        { status: 400 }
      );
    }

    const cleanIg = instagramHandle ? instagramHandle.replace(/^@/, "").trim() : null;
    const cleanYt = youtubeHandle ? youtubeHandle.trim() : null;

    const creator = await prisma.creator.create({
      data: {
        name: name.trim(),
        houseName: houseName ? houseName.trim() : "House Matrix",
        instagramHandle: cleanIg,
        youtubeHandle: cleanYt,
        targetCadence: targetCadence || "ALTERNATE",
        bio: bio ? bio.trim() : null,
      },
    });

    return NextResponse.json({ success: true, creator });
  } catch (err: any) {
    console.error("Error creating creator:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
