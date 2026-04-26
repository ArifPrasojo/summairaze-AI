import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: "API Key Gemini tidak ditemukan atau tidak valid. Silakan periksa file .env dan restart server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { documentId, message } = await req.json();

    if (!documentId || !message?.trim()) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    // Ambil dokumen beserta riwayat chat
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20, // Ambil 20 pesan terakhir sebagai konteks
        },
      },
    });

    if (!document || !document.textContent) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    // Simpan pesan user ke database
    await prisma.message.create({
      data: {
        documentId,
        role: "user",
        content: message,
      },
    });

    // Bangun konteks percakapan untuk dikirim ke Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const chat = model.startChat({
      history: document.messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    const systemContext = `Kamu adalah asisten AI yang membantu menjawab pertanyaan HANYA berdasarkan isi dokumen berikut. Jika pertanyaan tidak berkaitan dengan isi dokumen, katakan bahwa kamu hanya bisa menjawab berdasarkan dokumen yang diberikan. Jawab dalam Bahasa Indonesia yang baik dan benar.

ISI DOKUMEN:
---
${document.textContent.substring(0, 40000)}
---

Pertanyaan pengguna:`;

    try {
      const result = await chat.sendMessage(`${systemContext}\n\n${message}`);
      const replyText = result.response.text();

      // Simpan balasan asisten ke database
      const assistantMessage = await prisma.message.create({
        data: {
          documentId,
          role: "assistant",
          content: replyText,
        },
      });

      return NextResponse.json({ success: true, message: assistantMessage });
    } catch (apiError: any) {
      if (apiError.message?.includes("403")) {
        throw new Error("Akses Ditolak (403). Project Anda diblokir oleh Google. Mohon buat API Key di PROJECT BARU di AI Studio dan RESTART server.");
      }
      throw apiError;
    }
  } catch (error: any) {
    console.error("Chat error detail:", error);
    return NextResponse.json({ error: `Terjadi kesalahan saat memproses pesan: ${error.message}` }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return NextResponse.json({ error: "documentId diperlukan" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
