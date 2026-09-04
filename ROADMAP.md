# 🗺️ KopiPOS — Roadmap Pengembangan & Task Backlog

Dokumen ini mencatat **fitur-fitur yang belum dibuat / backlog** beserta panduan file mana yang perlu Anda modifikasi saat melanjutkan pengembangan di komputer lain.

---

## 📌 Status Ringkasan

| Komponen | Status Saat Ini | Persentase Selesai |
|---|---|:---:|
| **apps/pos (Desktop POS & KDS)** | Core UI, Printer Driver, KDS Server, & Outbox Sync Selesai | **90%** |
| **apps/admin (Vendor Hub Web)** | Dashboard, Manajemen Tenant, Lisensi & Billing Selesai | **85%** |
| **apps/api (Cloud Fastify API)** | Database schema, License service, & Sync API Selesai | **80%** |
| **packages (Shared Types & Utils)**| Formatters, Tax, UUID, Invoices Selesai | **100%** |

---

## 📋 Fitur yang Belum Dibuat (Backlog & To-Do)

### 1. 🖨️ Electron Windows Installer & Packaging (`apps/pos`)
- **Status**: ⏳ Belum dikonfigurasi
- **Deskripsi**: Membuat file installer `.exe` (atau `.msi`) yang siap di-install di komputer kasir Windows dengan 1-klik tanpa perlu install Node.js/pnpm di toko klien.
- **File Terkait**:
  - `apps/pos/package.json` (tambahkan konfigurasi `electron-builder`)
  - Target output: `release/KopiPOS-Setup-x64.exe`

### 2. 🔍 Barcode Scanner USB Listener (`apps/pos`)
- **Status**: ⏳ Belum diaktifkan
- **Deskripsi**: Menangkap input scanner barcode USB/Bluetooth secara global di kasir tanpa harus kasir klik kotak input terlebih dahulu.
- **File Terkait**:
  - `apps/pos/src/main/ipc/handlers.ts`
  - `apps/pos/src/preload/index.ts` (`onBarcodeScanned`)
  - `apps/pos/src/renderer/src/pages/CashierPage.tsx`

### 3. 💳 Payment Gateway Langganan Vendor (`apps/admin` & `apps/api`)
- **Status**: ⏳ Belum terhubung payment gateway otomatis
- **Deskripsi**: Saat ini penagihan langganan kafe sudah memiliki tombol WhatsApp reminder otomatis. Fitur berikutnya adalah integrasi Midtrans / Xendit agar pemilik kafe bisa langsung bayar langganan via QRIS / Virtual Account dan lisensi otomatis diperpanjang tanpa Anda harus approve manual.
- **File Terkait**:
  - `apps/api/src/routes/licenses.ts`
  - `apps/admin/src/app/billing/page.tsx`

### 4. 📄 Generator Ekspor CSV e-Faktur Pajak DJP (`apps/api` / `apps/pos`)
- **Status**: ⏳ Format tampilan sudah ada, generator CSV resmi belum
- **Deskripsi**: Menghasilkan file `.csv` yang persis sesuai skema impor e-Faktur Direktorat Jenderal Pajak (DJP) Indonesia agar akuntan kafe klien bisa langsung upload SPT Masa PPN.
- **File Terkait**:
  - `packages/shared-utils/src/tax.ts`
  - `apps/pos/src/renderer/src/pages/ReportsPage.tsx`

### 5. 🔄 Uji Coba End-to-End Offline 500 Transaksi
- **Status**: ⏳ Menunggu pengujian toko
- **Deskripsi**: Menjalankan simulasi 500 transaksi berturut-turut saat kabel LAN / Wi-Fi dicabut, memastikan database SQLite lokal stabil (<2ms per query), lalu mencolokkan kembali internet untuk memverifikasi 500 data terkirim utuh ke PostgreSQL cloud.

---

## 🛠️ Langkah Cepat Melanjutkan Development di Tempat Lain

Saat Anda membuka repository ini di komputer lain:

1. **Buka Terminal di folder project:**
   ```bash
   pnpm install
   ```
2. **Jalankan Aplikasi Kasir Desktop:**
   ```bash
   pnpm dev:pos
   ```
3. **Jalankan Dasbor Vendor:**
   ```bash
   pnpm dev:admin
   ```
4. **Jalankan Cloud Backend:**
   ```bash
   pnpm dev:api
   ```
5. **Cek task tracker kapan saja di file ini atau `README.md`!**
