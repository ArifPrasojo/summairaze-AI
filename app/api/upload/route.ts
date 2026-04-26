import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import mammoth from "mammoth";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Helper: extract text from PDF using pdf2json (pure Node.js, no browser APIs)
async function extractPdfText(buffer: Buffer): Promise<string> {
  const PDFParser = (await import("pdf2json")).default;

  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, true);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError || "PDF parse error"));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const text = (pdfParser as any).getRawTextContent();
        resolve(text);
      } catch (e: any) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let guestId = cookieStore.get("guest_id")?.value;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file melebihi 20MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    try {
      if (file.type === "application/pdf") {
        extractedText = await extractPdfText(buffer);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (file.type === "text/plain") {
        extractedText = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: "Format file tidak didukung. Gunakan PDF, DOCX, atau TXT." },
          { status: 400 }
        );
      }
    } catch (parseError: any) {
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { error: `Gagal membaca isi file: ${parseError.message}` },
        { status: 500 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Dokumen kosong atau tidak bisa dibaca" },
        { status: 400 }
      );
    }

    if (!guestId) guestId = uuidv4();

    const document = await prisma.document.create({
      data: {
        guestId,
        originalName: file.name,
        fileType: file.type.includes("pdf")
          ? "pdf"
          : file.type.includes("document")
          ? "docx"
          : "txt",
        textContent: extractedText,
      },
    });

    const response = NextResponse.json({ success: true, documentId: document.id });
    response.cookies.set("guest_id", guestId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("General Upload Error:", error);
    return NextResponse.json(
      { 
        error: "Sistem gagal memproses permintaan", 
        debug: error.message,
        hint: "Pastikan database sudah di-push menggunakan 'npx prisma db push'"
      },
      { status: 500 }
    );
  }
}
