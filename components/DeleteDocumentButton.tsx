"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteDocumentButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the document link
    e.stopPropagation();

    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini beserta semua ringkasannya?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/document/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      router.refresh();
    } catch (error) {
      alert("Gagal menghapus dokumen");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="relative z-20 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
      title="Hapus Dokumen"
    >
      {isDeleting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Trash2 className="w-5 h-5" />
      )}
    </button>
  );
}
