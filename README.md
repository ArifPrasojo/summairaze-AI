# SummAIrize - AI Document Summarizer

SummAIrize adalah platform cerdas berbasis AI yang membantu Anda meringkas dokumen panjang (PDF, Word, TXT) dalam hitungan detik. Menggunakan teknologi **Google Gemini 2.0 Flash** untuk akurasi dan kecepatan tinggi.

## Fitur Utama
- **7 Mode Ringkasan:** Mulai dari poin utama, analisis ilmiah, hingga persiapan ujian.
- **Chat Q&A:** Tanya jawab langsung dengan isi dokumen Anda.
- **Guest Mode:** Keamanan data terjaga, dokumen diproses secara anonim.
- **Multi-Format:** Mendukung PDF, DOCX, dan TXT.
- **Ekspor Ringkasan:** Unduh hasil ringkasan ke file teks (.txt).

---

## Panduan Instalasi (Setup)

Ikuti langkah-langkah di bawah ini untuk menjalankan project di mesin lokal Anda:

### 1. Persiapan
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18 atau terbaru)
- npm (Sudah termasuk dalam Node.js)

### 2. Instalasi Dependensi
Clone repositori ini dan jalankan perintah berikut di terminal:
```bash
npm install
```

### 3. Konfigurasi Environment (.env)
Buat file bernama `.env` di root direktori project dan tambahkan baris berikut:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="ISI_DENGAN_API_KEY_GEMINI_ANDA"
```
> **Catatan:** Anda bisa mendapatkan API Key secara gratis di [Google AI Studio](https://aistudio.google.com/).

### 4. Setup Database & Prisma
Jalankan perintah berikut untuk menyiapkan database SQLite dan men-generate Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Jalankan Aplikasi
Sekarang aplikasi siap dijalankan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## Teknologi yang Digunakan
- **Frontend/Backend:** [Next.js 15+ (App Router)](https://nextjs.org/)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/)
- **Database:** [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## Lisensi
Project ini dibuat untuk tujuan pembelajaran dan produktivitas pribadi.
