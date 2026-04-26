"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadZone() {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [manualText, setManualText] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleManualSubmit = async () => {
    if (!manualText.trim() || isUploading) return;
    
    setIsUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: manualText,
          title: manualTitle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memproses teks");
      }

      const data = await res.json();
      router.push(`/document/${data.documentId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    // ... (logic tetap sama seperti sebelumnya)
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimal 20MB");
      return;
    }
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setError("Hanya format PDF, DOCX, dan TXT yang didukung");
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengunggah dokumen");
      }
      const data = await res.json();
      router.push(`/document/${data.documentId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl mb-8 shadow-xl shadow-indigo-100/30 max-w-xs mx-auto relative z-10">
        <button 
          onClick={() => setActiveTab("file")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'file' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Unggah File
        </button>
        <button 
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Tempel Teks
        </button>
      </div>

      {activeTab === "file" ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-500 overflow-hidden ${
            isDragging 
              ? "border-indigo-500 bg-indigo-50/80 scale-[1.02] shadow-2xl shadow-indigo-200/50" 
              : "border-white/60 bg-white/60 backdrop-blur-md shadow-xl shadow-indigo-50/50 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1"
          } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center text-indigo-500 py-10">
              <Loader2 className="w-12 h-12 mb-4 animate-spin" />
              <p className="text-lg font-bold text-gray-900">Memproses Dokumen...</p>
              <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 mb-8 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Pilih atau Tarik File
              </h3>
              <p className="text-gray-500 mb-8 text-center max-w-sm leading-relaxed">
                Mendukung PDF, DOCX, dan TXT (Maks. 20MB)
              </p>
              <button className="px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg">
                Pilih File Sekarang
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={`bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl shadow-indigo-50/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 ${isUploading ? "opacity-70 pointer-events-none" : ""}`}>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Ringkasan (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Artikel Berita Hari Ini"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Teks untuk Diringkas</label>
            <textarea 
              rows={8}
              placeholder="Tempelkan atau ketikkan teks panjang Anda di sini..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
            />
          </div>
          <button 
            onClick={handleManualSubmit}
            disabled={!manualText.trim() || isUploading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sedang Memproses...
              </>
            ) : (
              "Mulai Ringkas Teks"
            )}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 flex items-start text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
          <div className="w-5 h-5 mr-3 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-red-600 font-bold">!</div>
          <p className="font-medium pt-0.5">{error}</p>
        </div>
      )}
    </div>
  );
}
