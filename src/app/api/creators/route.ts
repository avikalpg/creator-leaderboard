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

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    const cleanIg = instagramHandle ? instagramHandle.replace(/^@/, "").trim() : null;
    const cleanYt = youtubeHandle ? youtubeHandle.trim() : null;

    const creator = await prisma.creator.create({
      data: {
        name: name.trim(),
        houseName: houseName ? houseName.trim() : "Unassigned",
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, houseName, instagramHandle, youtubeHandle, targetCadence, bio, password } = body;

    const adminPass = process.env.ADMIN_PASSWORD || "genc2026";
    if (password !== adminPass) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    const cleanIg = instagramHandle !== undefined ? (instagramHandle ? instagramHandle.replace(/^@/, "").trim() : null) : undefined;
    const cleanYt = youtubeHandle !== undefined ? (youtubeHandle ? youtubeHandle.trim() : null) : undefined;

    const updated = await prisma.creator.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(houseName !== undefined ? { houseName: houseName.trim() } : {}),
        ...(cleanIg !== undefined ? { instagramHandle: cleanIg } : {}),
        ...(cleanYt !== undefined ? { youtubeHandle: cleanYt } : {}),
        ...(targetCadence ? { targetCadence } : {}),
        ...(bio !== undefined ? { bio: bio ? bio.trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, creator: updated });
  } catch (err: any) {
    console.error("Error updating creator:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const password = req.headers.get("x-admin-password") || searchParams.get("password");

    const adminPass = process.env.ADMIN_PASSWORD || "genc2026";
    if (password !== adminPass) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    await prisma.creator.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("Error deleting creator:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
