import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: "API Key Gemini tidak ditemukan atau tidak valid. Silakan periksa Environment Variables di Vercel." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;

    const { documentId, mode } = await req.json();

    if (!documentId || !mode) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.textContent) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan atau teks kosong" }, { status: 404 });
    }

    let systemPrompt = "Buatlah ringkasan dari dokumen ini.";
    if (mode === "summary") {
      systemPrompt = "Buatlah ringkasan pendek dan padat dalam 1-2 paragraf yang mencakup inti sari dokumen.";
    } else if (mode === "key_points") {
      systemPrompt = "Ekstrak poin-poin utama dari dokumen ini dalam bentuk daftar bullet points yang mudah dipahami.";
    } else if (mode === "executive") {
      systemPrompt = "Buatlah Executive Summary yang terstruktur dengan bagian: Ringkasan Utama, Temuan Penting, dan Kesimpulan.";
    } else if (mode === "scientific") {
      systemPrompt = "Buatlah ringkasan gaya jurnal ilmiah yang mencakup: Latar Belakang, Metodologi, Hasil Penelitian, dan Implikasi.";
    } else if (mode === "exam_prep") {
      systemPrompt = "Buatlah ringkasan untuk persiapan ujian. Sertakan 5 konsep kunci beserta penjelasannya dan 3 pertanyaan latihan berdasarkan teks.";
    } else if (mode === "action_items") {
      systemPrompt = "Identifikasi semua tindakan lanjutan (action items), tugas, atau rekomendasi yang disebutkan dalam dokumen dalam bentuk daftar centang.";
    } else if (mode === "tl_dr") {
      systemPrompt = "Berikan ringkasan TL;DR (Too Long; Didn't Read) yang sangat singkat dalam maksimal 2 kalimat saja.";
    } else if (mode === "humanoid") {
      systemPrompt = "Tulis ulang isi dokumen ini dengan gaya bahasa manusia yang natural. Hindari pola kalimat AI yang kaku, gunakan variasi panjang kalimat, gunakan kosakata yang tidak membosankan, dan jangan gunakan kata transisi klise seperti 'Selain itu', 'Kesimpulannya', atau 'Penting untuk dicatat'. Tujuannya adalah agar teks terlihat ditulis oleh manusia.";
    } else {
      return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `${systemPrompt}\n\nTeks Dokumen:\n${document.textContent.substring(0, 50000)}`;

    try {
      const result = await model.generateContent(prompt);
      const summaryText = result.response.text();

      const summary = await prisma.summary.create({
        data: {
          documentId,
          type: mode,
          content: summaryText,
        },
      });

      return NextResponse.json({ success: true, summary });
    } catch (apiError: any) {
      if (apiError.message?.includes("403")) {
        throw new Error("Akses Ditolak (403). Project Anda diblokir oleh Google. Mohon buat API Key di PROJECT BARU di AI Studio dan RESTART server.");
      }
      throw apiError;
    }
  } catch (error: any) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: `Gagal membuat ringkasan: ${error.message}` }, { status: 500 });
  }
}
