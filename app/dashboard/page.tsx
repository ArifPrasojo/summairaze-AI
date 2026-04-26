import { prisma } from "@/lib/prisma";
import UploadZone from "@/components/UploadZone";
import { FileText, Clock, ChevronRight, History } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const guestId = cookieStore.get("guest_id")?.value;

  const documents = (guestId 
    ? await prisma.document.findMany({
        where: { guestId: guestId },
        orderBy: { createdAt: "desc" },
        include: {
          summaries: true,
        },
      })
    : []) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">SummAIrize</span>
        </div>
        
        <div className="p-4 flex-grow">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium transition-colors">
            <History className="w-5 h-5" />
            <span>Riwayat Dokumen</span>
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Mode Publik (Tanpa Login)</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <header>
            <h1 className="text-3xl font-bold text-gray-900">Halo! 👋</h1>
            <p className="text-gray-500 mt-2">Unggah dokumen baru atau lihat riwayat ringkasan Anda di sini.</p>
          </header>

          <section>
            <UploadZone />
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Riwayat Terakhir</h2>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Belum ada dokumen</h3>
                <p className="text-gray-500 mt-1 text-sm">Unggah dokumen pertama Anda untuk mulai membuat ringkasan.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href={`/document/${doc.id}`}
                    className="flex items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 truncate">{doc.originalName}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium uppercase tracking-wider">
                          {doc.fileType}
                        </span>
                        {doc.summaries.length > 0 && (
                          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                            {doc.summaries.length} Ringkasan
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
