import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import { FileText, Clock, ChevronRight, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      summaries: true,
    },
  });

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
            <Clock className="w-5 h-5" />
            <span>Riwayat Dokumen</span>
          </Link>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            {session.user.image ? (
              <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10">

          <header>
            <h1 className="text-3xl font-bold text-gray-900">Halo, {session.user.name?.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 mt-2">Unggah dokumen baru atau lihat riwayat ringkasan Anda di sini.</p>
          </header>

          <section>
            <UploadZone />
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Riwayat Anda</h2>
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
