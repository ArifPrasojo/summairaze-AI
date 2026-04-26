import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Prisma will automatically delete related summaries and messages 
    // if onDelete: Cascade is configured in schema.prisma.
    // Let's manually delete them first just to be safe if cascade isn't set up.
    await prisma.summary.deleteMany({
      where: { documentId: id },
    });
    
    await prisma.message.deleteMany({
      where: { documentId: id },
    });

    await prisma.document.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
