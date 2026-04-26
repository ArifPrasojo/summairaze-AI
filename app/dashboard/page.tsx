import { prisma } from "@/lib/prisma";
import UploadZone from "@/components/UploadZone";
import { FileText, Clock, ChevronRight, History, Sparkles, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

function getGreeting() {
  // Use UTC+7 (WIB) approximate or server time.
  // In server components, time is based on the server.
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

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

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute top-1/3 -left-1/4 w-1/2 h-1/2 bg-purple-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      {/* Sidebar - Glassmorphism */}
      <aside className="w-full md:w-72 relative z-20 glass-morphism border-b md:border-b-0 md:border-r border-white/50 flex flex-col md:h-screen sticky top-0 bg-white/80 backdrop-blur-xl">
        <div className="p-6 md:p-8 border-b border-gray-100/50 flex items-center justify-between md:justify-start space-x-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight block">
                SummAIrize
              </span>
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-2 bg-green-50/80 border border-green-100 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex p-6 flex-grow flex-col space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-white shadow-sm border border-indigo-50 text-indigo-700 font-medium transition-all hover:shadow-md group">
            <LayoutDashboard className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-500 font-medium transition-all hover:bg-gray-50/50 cursor-pointer group">
            <History className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <span className="group-hover:text-gray-700 transition-colors">Riwayat Dokumen</span>
          </div>
        </div>

        <div className="hidden md:block p-6 border-t border-gray-100/50">
          <div className="flex items-center justify-center space-x-2 bg-green-50/80 border border-green-100 px-4 py-3 rounded-2xl backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-green-700">Mode Publik Aktif</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header */}
          <header className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              {greeting}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-lg text-gray-500 mt-3 font-medium">
              Sistem AI siap membantu Anda menguraikan dokumen hari ini.
            </p>
          </header>

          {/* Upload Zone Section */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <UploadZone />
          </section>

          {/* History Section */}
          <section className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-indigo-500" />
                Riwayat Terakhir
              </h2>
              {documents.length > 0 && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold border border-indigo-100">
                  {documents.length} Dokumen
                </span>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200/70 rounded-3xl bg-white/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Area Riwayat Bersih</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  Setiap dokumen yang Anda ringkas akan otomatis tersimpan dengan aman di sini.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {documents.map((doc, index) => (
                  <Link 
                    key={doc.id} 
                    href={`/document/${doc.id}`}
                    className="group relative flex items-center p-5 bg-white/80 backdrop-blur-md rounded-2xl border border-white hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-colors duration-500" />
                    
                    <div className="relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 mr-5 flex-shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-indigo-100/50">
                      <FileText className="w-7 h-7" />
                    </div>
                    
                    <div className="relative z-10 flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                        {doc.originalName}
                      </h4>
                      <div className="flex items-center mt-2 flex-wrap gap-3">
                        <span className="flex items-center text-sm font-medium text-gray-500">
                          <History className="w-4 h-4 mr-1.5 opacity-70" />
                          {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </span>
                        
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100/80 text-gray-600 border border-gray-200/50">
                          {doc.fileType}
                        </span>
                        
                        {doc.summaries.length > 0 && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/50 flex items-center">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {doc.summaries.length} Ringkasan
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:shadow-md transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
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
