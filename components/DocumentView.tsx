"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, ArrowLeft, Loader2, Sparkles, Copy, Download, MessageSquare, Send, User, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DocumentView({ document }: { document: any }) {
  const [activeTab, setActiveTab] = useState("summary"); // "summary" or "chat"
  const [summaryMode, setSummaryMode] = useState("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSummary, setActiveSummary] = useState(
    document.summaries.length > 0 ? document.summaries[0] : null
  );

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(document.messages || []);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          mode: summaryMode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat ringkasan");
      }

      const data = await res.json();
      setActiveSummary(data.summary);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses ringkasan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsSending(true);

    // Optimistic update
    setMessages((prev: any) => [...prev, { role: "user", content: userMessage, id: "temp-" + Date.now() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          message: userMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mengirim pesan");
      }

      const data = await res.json();
      setMessages((prev: any) => [...prev.filter((m: any) => !m.id.startsWith("temp-")), data.message]);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses pertanyaan Anda");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    if (activeSummary) {
      navigator.clipboard.writeText(activeSummary.content);
      alert("Disalin ke clipboard!");
    }
  };

  const handleDownload = () => {
    if (!activeSummary) return;

    const element = window.document.createElement("a");
    const file = new Blob([activeSummary.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Ringkasan_${activeSummary.type}_${document.originalName}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h1 className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                {document.originalName}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Column: Actions & Document Info */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI Studio
            </h2>

            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'summary' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Chat Q&A
              </button>
            </div>

            {activeTab === "summary" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode Ringkasan</label>
                  <select
                    value={summaryMode}
                    onChange={(e) => setSummaryMode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors"
                  >
                    <option value="summary">📝 Ringkasan Pendek (1-2 Paragraf)</option>
                    <option value="key_points">📌 Poin Utama (Bullet Points)</option>
                    <option value="executive">👔 Executive Summary (Formal)</option>
                    <option value="scientific">🔬 Analisis Ilmiah (Metodologi/Hasil)</option>
                    <option value="exam_prep">🎓 Persiapan Ujian (Konsep & Soal)</option>
                    <option value="action_items">✅ Daftar Tugas (Action Items)</option>
                    <option value="tl_dr">⚡ TL;DR (Sangat Singkat)</option>
                    <option value="humanoid">👤 Gaya Bahasa Manusia (Anti-AI Detection)</option>
                  </select>
                </div>

                <button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Mulai Ringkas"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Tanyakan apa pun tentang dokumen ini. AI akan menjawab berdasarkan isi teks yang ada.</p>
                <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100 italic">
                  "Contoh: Apa kesimpulan utama dari dokumen ini?"
                </div>
              </div>
            )}
          </div>

          {activeTab === "summary" && document.summaries.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Ringkasan</h2>
              <div className="space-y-3">
                {document.summaries.map((sum: any, idx: number) => (
                  <button
                    key={sum.id}
                    onClick={() => setActiveSummary(sum)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${activeSummary?.id === sum.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <div className="capitalize font-semibold mb-1">{sum.type.replace('_', ' ')}</div>
                    <div className="text-xs opacity-70">
                      {new Date(sum.createdAt).toLocaleString('id-ID')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Content */}
        <div className="w-full lg:w-2/3 flex flex-col h-full overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">

            {activeTab === "summary" ? (
              <>
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">Hasil Ringkasan AI</h3>
                      <p className="text-xs text-gray-500 capitalize">{summaryMode.replace('_', ' ')} Mode</p>
                    </div>
                  </div>
                  {activeSummary && (
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                        title="Salin ke Clipboard"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Salin</span>
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-1"></div>
                      <button
                        onClick={handleDownload}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                        title="Unduh Ringkasan (.txt)"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Unduh</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 overflow-y-auto bg-gray-50/30 relative">
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center text-center p-8 transition-all animate-in zoom-in-95 duration-500 rounded-2xl">
                      {/* Glowing orb */}
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-indigo-500 blur-[40px] rounded-full opacity-50 animate-pulse scale-150"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-bounce shadow-lg border border-white/20">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-3 tracking-tight">
                        Menyusun Ringkasan Cerdas...
                      </h3>
                      <p className="text-gray-600 font-medium mb-4">Menganalisis miliaran parameter untuk hasil terbaik</p>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}

                  {activeSummary ? (
                    <div className={`max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 transition-all duration-500 ${isGenerating ? 'opacity-20 blur-[2px] scale-[0.98]' : 'opacity-100 scale-100'}`}>
                      <div className="prose prose-indigo prose-lg max-w-none text-gray-700 leading-[1.8] whitespace-pre-wrap font-serif">
                        {activeSummary.content}
                      </div>

                      <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                        <p>Diringkas oleh SummAIrize AI • {new Date(activeSummary.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>AI Generated Content</span>
                        </div>
                      </div>
                    </div>
                  ) : !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-6 border border-gray-50">
                        <Sparkles className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Siap untuk meringkas?</h3>
                      <p className="text-gray-500 max-w-sm">
                        Pilih mode di panel kiri dan tekan tombol "Mulai Ringkas" untuk melihat keajaiban AI bekerja.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
                  <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                  <h3 className="font-semibold text-gray-800">Chat with Document</h3>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                      <MessageSquare className="w-12 h-12 mb-3" />
                      <p>Ketikkan pertanyaan untuk mulai bertanya pada AI tentang dokumen ini.</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'ml-3 bg-indigo-600' : 'mr-3 bg-gray-200'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[85%] flex-row">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 bg-gray-200">
                          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        </div>
                        <div className="p-4 rounded-2xl text-sm bg-indigo-50 text-indigo-600 font-medium rounded-tl-none border border-indigo-100 flex items-center">
                          <span className="mr-2">Sedang menyusun jawaban...</span>
                          <span className="flex space-x-1">
                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tanyakan sesuatu..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isSending}
                      className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
