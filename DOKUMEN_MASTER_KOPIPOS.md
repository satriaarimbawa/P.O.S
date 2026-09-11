# ☕ KOPIPOS — DOKUMEN MASTER PRODUK, DESAIN UI/UX & SISTEM LAPORAN
> **Platform Point of Sale (POS) SaaS Multi-Tenant & Offline-First untuk Kafe dan Restoran**  
> *Versi Dokumen: 1.0 │ Tanggal: 4 September 2026*

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & Model Bisnis SaaS](#1-ringkasan-eksekutif--model-bisnis-saas)
2. [Nilai Pembeda (Unique Selling Points)](#2-nilai-pembeda-unique-selling-points)
3. [Arsitektur Teknis & Tech Stack](#3-arsitektur-teknis--tech-stack)
4. [Kustomisasi UI per Kafe (White-Labeling & Theming)](#4-kustomisasi-ui-per-kafe-white-labeling--theming)
5. [Desain Antarmuka & User Flow (UI/UX)](#5-desain-antarmuka--user-flow-uiux)
   - 5.1 Aktivasi Lisensi & Login PIN Staff
   - 5.2 Layar Kasir Utama (Cashier Grid & Order Panel)
   - 5.3 Kitchen Display System (KDS) Barista & Dapur
   - 5.4 Portal Laporan Owner (Daily, Weekly, Monthly)
   - 5.5 Vendor Admin Dashboard (Untuk Anda)
6. [Format Lengkap Laporan (10 Jenis Laporan)](#6-format-lengkap-laporan-10-jenis-laporan)
   - 6.1 Z-Report (Tutup Shift - Thermal 80mm & PDF)
   - 6.2 Struk Thermal Harian Toko (EOD Closing) untuk Barista & Kasir
   - 6.3 Laporan Harian, Mingguan & Bulanan Owner
   - 6.4 Laporan Pajak PPN (Format Standar & CSV e-Faktur)
   - 6.5 Laporan Bahan Baku & Margin Produk
7. [Struktur Proyek Monorepo & Skema Database](#7-struktur-proyek-monorepo--skema-database)
8. [Roadmap & Tahapan Pengembangan (14 Minggu)](#8-roadmap--tahapan-pengembangan-14-minggu)

---

## 1. Ringkasan Eksekutif & Model Bisnis SaaS

**KopiPOS** adalah solusi sistem kasir modern yang dirancang khusus untuk Anda jual kembali (*Software-as-a-Service*) kepada pemilik kafe dan restoran. 

### Model Bisnis:
- **Model Lisensi Berlangganan**: Dijual dengan skema biaya bulanan/tahunan per outlet (misal Rp 149.000 – Rp 299.000/outlet/bulan).
- **Multi-Tenant Terisolasi**: Setiap kafe klien memiliki data mandiri, logo mandiri, dan pengaturan harga sendiri.
- **Vendor Central Dashboard**: Anda memiliki dasbor pusat untuk menerbitkan lisensi, memantau masa aktif kafe, memantau total omset yang diproses (GMV), serta menonaktifkan kafe yang menunggak langganan.

---

## 2. Nilai Pembeda (Unique Selling Points)

Mengapa pemilik kafe akan memilih KopiPOS dibanding POS konvensional:

1. **100% Offline-First (Anti Internet Lemot)**:
   - Kasir tetap bisa transaksi, cetak struk, dan buka laci kas meskipun Wi-Fi putus total. Begitu internet kembali, data otomatis tersinkronisasi ke *cloud*.
2. **Kustomisasi Penuh Sesuai Konsep Kafe**:
   - Tampilan kasir dan struk bisa disesuaikan dengan warna dan logo kafe klien (tidak kaku dan seragam).
3. **Kitchen Display System (KDS) Real-Time via LAN (Sub-50ms)**:
   - Pesanan kasir langsung muncul di tablet barista/dapur tanpa lewat server internet publik. Kopi tidak dingin karena delay cloud.
4. **Transparansi Barista & Kasir (Struk Harian EOD)**:
   - Struk thermal tutup toko mencatat personil kasir & barista per shift serta estimasi bahan baku (biji kopi, susu oat, cup) untuk mencegah saling tuduh selisih stok.
5. **AI Financial Insight**:
   - Memberikan rekomendasi bisnis otomatis (contoh: *"Iced Latte margin 68% — jadikan menu highlight"* atau *"Jam 14-16 sepi — buat promo happy hour"*).
6. **Laporan Siap Pajak (PPN 11% & e-Faktur)**:
   - Ekspor CSV otomatis yang kompatibel dengan pelaporan pajak Indonesia.

---

## 3. Arsitektur Teknis & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                            IN-STORE / OUTLET LAN                                  |
|                                                                                   |
|  +---------------------------+                   +-----------------------------+  |
|  |    Cashier POS Terminal   |   LAN WebSocket   |  Kitchen Display (KDS) /    |  |
|  |  (Electron + React + TS)  |==================>|  Bar Display (Tablet/Web)   |  |
|  |                           |     (Sub-50ms)    |                             |  |
|  |  +---------------------+  |                   +-----------------------------+  |
|  |  | better-sqlite3 +    |  |                                                    |
|  |  | Drizzle ORM (Local) |  |   Raw ESC/POS     +-----------------------------+  |
|  |  +----------+----------+  |------------------>| Thermal Receipt Printer     |  |
|  |             |             |   (USB / LAN)     | + Cash Drawer (RJ11 Kick)   |  |
|  |  +----------v----------+  |                   +-----------------------------+  |
|  |  | Transactional       |  |                                                    |
|  |  | Outbox Engine       |  |                   +-----------------------------+  |
|  +-------------+-------------+                   | Barcode Scanner (2D/QR)     |  |
|                |                                 +-----------------------------+  |
+----------------|------------------------------------------------------------------+
                 | HTTPS / WSS Sync (Saat Online)
+----------------v------------------------------------------------------------------+
|                            CLOUD INFRASTRUCTURE                                   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Fastify API Gateway + JWT Licensing Engine (Node.js + TypeScript)           |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  | PostgreSQL Central Database (Drizzle ORM + Row Level Security)             |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  | Vendor Admin Portal (Next.js) & Dynamic QRIS Gateway (Midtrans / Xendit)   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Tabel Komponen Teknologi
| Kategori | Teknologi | Kegunaan |
|---|---|---|
| **Aplikasi Kasir (Desktop)** | Electron 33 + electron-vite + React 19 + TypeScript | Aplikasi kasir toko (Windows / POS Terminal Touchscreen) |
| **Database Lokal** | SQLite via `better-sqlite3` + Drizzle ORM | Penyimpanan lokal super cepat (<2ms per query), mode WAL |
| **Antarmuka (UI/UX)** | Tailwind CSS + Lucide Icons + Zustand | UI responsif, state management ringan, CSS Variables dinamis |
| **Perangkat Keras** | `node-thermal-printer` (ESC/POS) | Cetak struk LAN/USB/Serial, auto-cutter, dan dorongan laci kas |
| **KDS Real-Time** | `ws` (WebSocket) + `bonjour-service` (mDNS) | Routing order di jaringan lokal toko tanpa internet |
| **Backend Cloud** | Node.js + Fastify + PostgreSQL | Sinkronisasi outbox, manajemen lisensi, autentikasi |
| **Portal Vendor** | Next.js + Tremor Charts | Dasbor web untuk Anda mengelola kafe klien |

---

## 4. Kustomisasi UI per Kafe (White-Labeling & Theming)

Aplikasi POS dapat mengubah tampilan secara dinamis mengikuti branding kafe:

| Elemen Kustom | Pilihan Pengaturan | Dampak pada POS |
|---|---|---|
| **Warna Tema** | Kode HEX warna utama (*Primary*) dan aksen (*Accent*) | Warna sidebar, tombol bayar, border kartu, dan status order otomatis berubah |
| **Logo Brand** | Unggah file logo kafe (PNG/SVG) | Muncul di pojok atas kasir, layar login PIN, dan layar kedua pelanggan |
| **Gaya Tata Letak Menu** | 1. **Mode Foto Estetis**<br/>2. **Mode Tombol Cepat (Speed Grid)**<br/>3. **Mode Meja (Dine-in Floor Plan)** | Kafe estetik menggunakan foto besar; gerai kopi cepat saji (*takeaway booth*) menggunakan tombol kotak warna cepat |
| **Struk Thermal** | Logo monokrom, Alamat, **Info Wi-Fi & Password**, Instagram kafe, pesan promo footer | Struk kasir menjadi sarana promosi dan interaksi pelanggan |
| **Stasiun Produksi** | Konfigurasi rute KDS:<br/>• Kafe 1 Stasiun: Barista saja<br/>• Kafe & Resto: Barista + Dapur Panas + Pastry | Order otomatis terpisah ke layar masing-masing stasiun kerja |

---

## 5. Desain Antarmuka & User Flow (UI/UX)

> 📘 **Panduan Lengkap & Spesifikasi Mendalam**:  
> Lihat dokumen terpisah [**DOKUMEN_DESAIN_UI_UX.md**](./DOKUMEN_DESAIN_UI_UX.md) untuk pedoman lengkap desain sistem, palet warna, tipografi, standar ergonomi sentuh (Fitts's Law 48px), wireframe ASCII interaktif, serta alur anti-human-error rantai pasok dan stock opname.

### 5.1 Aktivasi Lisensi & Login PIN Staff
1. **Layar Aktivasi**: Pertama kali aplikasi dipasang, muncul input lisensi berformat `KPOS-XXXX-XXXX-XXXX`. Aplikasi menghubungi server cloud, memverifikasi masa aktif, mengunduh logo & warna kafe, lalu mengunci mesin (*machine fingerprint*).
2. **Layar Login PIN**: Kasir dan Barista cukup memasukkan **4 digit PIN** pada keypad numerik layar sentuh untuk masuk ke shift mereka.

### 5.2 Layar Kasir Utama (Cashier Page)
- **Sisi Kiri (Menu Area)**:
  - Tab kategori di bagian bawah: `[Kopi]`, `[Non-Kopi]`, `[Makanan]`, `[Snack]`.
  - Grid kartu produk dengan foto, nama, dan harga Rupiah.
  - Opsi varian/modifier otomatis muncul saat produk ditekan (Pilihan Ukuran: Regular / Large; Suhu: Hot / Iced; Jenis Susu: Fresh Milk / Oat Milk).
- **Sisi Kanan (Order Panel)**:
  - Nomor Order unik (contoh: `INV-JKT01-R01-260904-0042`).
  - Tipe Pesanan: `[Dine-In]` / `[Take Away]` / `[Delivery]`.
  - Pilihan Meja.
  - Rincian item pesanan, Subtotal, PPN 11%, dan Grand Total.
  - Tombol aksi: `[🗑️ Hapus Cart]` dan `[💳 PROSES BAYAR]`.
- **Dialog Pembayaran**:
  - Tombol metode: **CASH**, **QRIS DINAMIS**, **E-WALLET**, **DEBIT**.
  - Untuk Cash: Pilihan uang pas atau nominal pecahan cepat (Rp 50K, Rp 100K, Rp 200K) dan kalkulasi otomatis uang kembalian.
  - Setelah bayar: Laci kas otomatis menendang terbuka (*kick drawer*) dan struk tercetak otomatis.

### 5.3 Kitchen Display System (KDS)
Layar tablet untuk Barista dan Dapur dengan 3 kolom status warna:
- 🔴 **PENDING (Merah)**: Pesanan baru masuk dari kasir. Dilengkapi penghitung waktu (*elapsed timer*).
- 🟡 **IN PROGRESS (Kuning)**: Barista menekan tombol *"Mulai Racik"*.
- 🟢 **READY (Hijau)**: Minuman selesai diracik, siap diambil pelayan (*runner*) atau dipanggil nomor antreannya.

### 5.4 Portal Laporan Owner (Daily, Weekly, Monthly)
Tampilan antarmuka khusus pemilik kafe dengan saklar periode:
- **Tab Harian (Daily)**: Rincian transaksi real-time per jam, status kas laci toko, serta tombol **`[ 🖨️ Cetak Struk Harian (Thermal 80mm) ]`**.
- **Tab Mingguan (Weekly)**: Grafik batang perbandingan 7 hari (Senin–Minggu) untuk melihat pola hari teramai vs sepi guna menyusun jadwal barista.
- **Tab Bulanan (Monthly)**: Omset bulanan, estimasi laba kotor (*gross margin*), biaya bahan baku (HPP), dan proyeksi arus kas.

### 5.5 Vendor Admin Dashboard (Untuk Anda)
Dasbor pusat untuk Anda mengelola seluruh kafe klien:
- Metrik platform: Total kafe aktif, MRR (*Monthly Recurring Revenue*), total GMV transaksi.
- Manajemen Lisensi: Terbitkan lisensi baru, perpanjang langganan, nonaktifkan outlet yang menunggak.

---

## 6. Format Lengkap Laporan (10 Jenis Laporan)

### 6.1 Z-Report (Laporan Tutup Shift Kasir)
*Format: Struk Thermal 80mm & File PDF*

```
================================================
            ☕ KOPI NUSA SENOPATI
          Jl. Senopati No. 42, Jakarta
================================================
              Z-REPORT / TUTUP SHIFT
================================================
Shift       : #003
Kasir       : Rian Hidayat
Register    : Kasir 1 (REG-01)
Dibuka      : 04/09/2026  09:14
Ditutup     : 04/09/2026  17:32
Durasi      : 8 jam 18 menit
================================================
--- RINGKASAN PENJUALAN ------------------
Total Transaksi         :           156
Total Void/Batal        :             3
Transaksi Bersih        :           153

Penjualan Kotor         :   Rp 4.530.000
Diskon                  :  (Rp   300.000)
                          ─────────────
Penjualan Bersih (DPP)  :   Rp 4.230.000
PPN 11%                 :   Rp   465.300
                          ═════════════
TOTAL PENDAPATAN        :   Rp 4.695.300

--- PEMBAYARAN PER METODE ----------------
CASH                    :   Rp 2.100.000 (78 Trx)
QRIS DINAMIS            :   Rp 1.830.000 (55 Trx)
E-Wallet (GoPay)        :   Rp   300.000 (10 Trx)
Debit Card              :   Rp   465.300 (10 Trx)

--- REKONSILIASI KAS REGISTER ------------
Kas Awal                :   Rp   500.000
+ Penjualan Cash        :   Rp 2.100.000
                          ─────────────
Kas Seharusnya          :   Rp 2.600.000
Kas Aktual di Laci      :   Rp 2.580.000
                          ─────────────
SELISIH                 :  (Rp    20.000)
Status                  : ⚠️  KURANG Rp 20.000

================================================
  [TTD Kasir]                 [TTD Manager]

 ______________              ______________
   Rian H.                      Budi S.
================================================
```

---

### 6.2 Struk Thermal Harian Toko (EOD Closing) untuk Barista & Kasir
*Format: Struk Thermal 80mm — Dicetak saat Toko Tutup Buku Harian*

```
================================================
            ☕ KOPI NUSA SENOPATI
          Jl. Senopati No. 42, Jakarta
================================================
         LAPORAN HARIAN TOKO (END OF DAY)
================================================
Tanggal Toko : 04 September 2026
Waktu Tutup  : 04/09/2026  23:15:08
Status Toko  : CLOSED / TUTUP BUKU
Outlet Code  : JKT01 (Senopati Flagship)
================================================

--- DAFTAR STAF & SHIFT BERTUGAS ---------------

[SHIFT 1: PAGI (07:00 - 14:30)]
  • Kasir Bertugas   : Sari Novita (REG-01)
  • Barista Utama    : Budi Santoso (Barista-1)
  • Server / Runner  : Fajar J.
  • Transaksi Kasir  : 98 Order (Rp 2.800.000)

[SHIFT 2: SORE (14:30 - 21:00)]
  • Kasir Bertugas   : Rian Hidayat (REG-01)
  • Barista Utama    : Dimas Anggara (Barista-1)
  • Barista Bar      : Lisa Maharani (Barista-2)
  • Transaksi Kasir  : 112 Order (Rp 3.400.000)

[SHIFT 3: MALAM (21:00 - 23:00)]
  • Kasir & Barista  : Dian Kusuma (REG-01)
  • Transaksi Kasir  : 24 Order (Rp 600.000)

>> Total Personil Bertugas: 7 Orang

--- REKAP PRODUKSI STASIUN BARISTA -------------
(Cross-check fisik bahan baku vs transaksi kasir)

Total Minuman Terjual   :           188 Cup
  • Cup Regular         :           120 Cup
  • Cup Large           :            68 Cup

Estimasi Penggunaan Bahan Kritis:
  • Biji Kopi Terpakai  :        ~3.760 Gram
    (Double Shot Basis  :          188 Shot)
  • Susu Fresh Milk (L) :          ~18,5 Liter
  • Susu Oat Milk (L)   :           ~3,2 Liter
  • Sirup Caramel       :            45 Pump
  • Sirup Vanilla       :            32 Pump

--- REKAP PRODUKSI DAPUR / KITCHEN -------------
Total Makanan & Snack   :            78 Porsi
  • Nasi Goreng         :            22 Porsi
  • Indomie Goreng      :            18 Porsi
  • Croissant Pastry    :            18 Pcs
  • Kentang Goreng      :            12 Porsi
  • Roti Bakar          :             8 Porsi

--- IKHTISAR PENJUALAN HARIAN ------------------
Total Transaksi Bersih  :           234 Trx
Penjualan Kotor         :   Rp 7.250.000
Diskon Promo/Voucher    :  (Rp   450.000)
                          ─────────────
Penjualan Bersih (DPP)  :   Rp 6.800.000
PPN 11% Terkumpul       :   Rp   748.000
                          ═════════════
TOTAL OMSET HARI INI    :   Rp 7.548.000

--- BREAKDOWN PEMBAYARAN -----------------------
CASH / TUNAI            :   Rp 3.060.000 (45%)
QRIS DINAMIS            :   Rp 2.176.000 (32%)
E-WALLET                :   Rp 1.020.000 (15%)
DEBIT CARD              :   Rp   544.000 ( 8%)

--- REKONSILIASI KAS REGISTER TOKO -------------
Total Kas Masuk Fisik   :   Rp 3.060.000
Total Setoran Brankas   :   Rp 2.500.000
Sisa Modal Kembalian    :   Rp   500.000 (Besok)
Selisih Kas Harian      :  (Rp    20.000) [Shift 2]

================================================
PERTANGGUNGJAWABAN PENUTUPAN TOKO:

   Lead Barista       Head Cashier      Supervisor
                                       
  ( Dimas A. )       ( Rian H. )       ( Budi S. )
================================================
   Dicetak otomatis saat End-of-Day Closing
   KopiPOS SaaS v0.1.0 │ Terminal: REG-01
================================================
```

---

### 6.3 Matriks Format Seluruh Laporan
| Laporan | 🖨️ Thermal Print | 📄 PDF Resmi | 📊 Excel | 📋 CSV | 📧 Auto Email |
|---|:---:|:---:|:---:|:---:|:---:|
| 1. Z-Report (Tutup Shift) | ✅ | ✅ | ❌ | ❌ | ✅ |
| 2. X-Report (Snapshot) | ✅ | ❌ | ❌ | ❌ | ❌ |
| 3. Daily Sales (EOD) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4. Weekly/Monthly Sales | ❌ | ✅ | ✅ | ✅ | ✅ |
| 5. Product Mix & Margin | ❌ | ✅ | ✅ | ✅ | ✅ |
| 6. Pajak PPN e-Faktur | ❌ | ✅ | ✅ | ✅ (DJP) | ✅ |
| 7. Pergerakan Stok/Bahan | ❌ | ✅ | ✅ | ✅ | ✅ |
| 8. Performa Staff Kasir/Barista | ❌ | ✅ | ❌ | ❌ | ✅ |
| 9. Rekonsiliasi Pembayaran Bank | ❌ | ✅ | ✅ | ✅ | ✅ |
| 10. Vendor Cross-Tenant Analytics | ❌ | ✅ | ✅ | ❌ | ✅ |

---

## 7. Struktur Proyek Monorepo & Skema Database

Proyek KopiPOS dibangun dengan struktur **Turborepo** monorepo:

```
d:\CHACE\Pemikiran\
├── apps/
│   ├── pos/                  # Aplikasi kasir desktop (Electron + React + better-sqlite3)
│   ├── api/                  # Cloud API & lisensi (Node.js + Fastify + PostgreSQL)
│   └── admin/                # Dasbor web vendor untuk Anda mengelola semua kafe klien
├── packages/
│   ├── shared-types/         # Definisi tipe data TypeScript bersama
│   └── shared-utils/         # Utilitas format Rupiah, hitung PPN, invoice generator
├── package.json              # Konfigurasi root monorepo
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 8. Roadmap & Tahapan Pengembangan (14 Minggu)

| Fase | Waktu | Fokus Utama |
|---|---|---|
| **Fase 1: Fondasi & Lisensi** | Minggu 1–3 | Setup monorepo, database lokal & cloud, generator kunci lisensi RSA, aktivasi lisensi di kasir |
| **Fase 2: Core POS & Hardware** | Minggu 4–6 | UI kasir, cart pesanan, integrasi printer thermal ESC/POS, auto-cutter, cash drawer kick, KDS via WebSocket LAN |
| **Fase 3: Laporan & Sinkronisasi** | Minggu 7–9 | Z-Report, struk thermal harian EOD, engine sinkronisasi offline outbox, rekap PPN |
| **Fase 4: Portal Owner & Vendor** | Minggu 10–12 | Dashboard vendor untuk kelola klien kafe, sistem penagihan langganan, kustomisasi tema visual |
| **Fase 5: Pengujian & Peluncuran** | Minggu 13–14 | Uji coba ketahanan offline 500 transaksi, installer Windows (.exe), materi pemasaran produk |

---
*Dokumen Resmi KopiPOS SaaS.*
