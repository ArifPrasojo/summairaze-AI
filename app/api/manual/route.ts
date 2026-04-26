import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { text, title } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Teks terlalu pendek (minimal 10 karakter)" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let guestId = cookieStore.get("guest_id")?.value;

    if (!guestId) {
      guestId = uuidv4();
      cookieStore.set("guest_id", guestId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // Simpan teks manual sebagai dokumen virtual
    const document = await prisma.document.create({
      data: {
        guestId,
        originalName: title || "Teks Manual " + new Date().toLocaleDateString('id-ID'),
        fileType: "text/plain",
        textContent: text,
      },
    });

    return NextResponse.json({ documentId: document.id });
  } catch (error) {
    console.error("Manual Text Upload Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses teks manual" },
      { status: 500 }
    );
  }
}
