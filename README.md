# ☕ KopiPOS — Platform POS Multi-Tenant SaaS (Offline-First)

> **Sistem Point of Sale (POS) Modern, Cerdas, dan Terisolasi untuk Kafe & Restoran**  
> Dibangun dengan arsitektur **Offline-First**, **KDS Real-Time via LAN (<50ms)**, **Driver Thermal ESC/POS**, serta **Portal Vendor SaaS Multi-Tenant**.

---

## 📑 Daftar Isi
1. [Tentang Proyek](#-tentang-proyek)
2. [Fitur Utama & Keunggulan](#-fitur-utama--keunggulan)
3. [Arsitektur & Struktur Monorepo](#-arsitektur--struktur-monorepo)
4. [Panduan Setup & Menjalankan (Di Mana Saja)](#-panduan-setup--menjalankan-di-mana-saja)
5. [Status Fitur: Selesai vs Belum Dibuat (Roadmap)](#-status-fitur-selesai-vs-belum-dibuat-roadmap)
6. [Daftar Perintah (Cheatsheet)](#-daftar-perintah-cheatsheet)
7. [Dokumentasi Lengkap Terkait](#-dokumentasi-lengkap-terkait)

---

## 📖 Tentang Proyek

**KopiPOS** adalah produk perangkat lunak B2B SaaS (*Software as a Service*) yang dirancang untuk Anda jual kembali kepada para pemilik kafe dan restoran. Sistem ini dirancang untuk menyelesaikan masalah terbesar POS konvensional di Indonesia:
- ❌ **Ketergantungan Internet Penuh**: Kasir macet saat koneksi Wi-Fi toko lemot/putus.
- ❌ **Keterlambatan Pesanan ke Barista**: Pesanan harus memutar ke server cloud luar negeri sebelum sampai ke tablet dapur.
- ❌ **Desain Kaku**: Tampilan tidak bisa disesuaikan dengan estetika brand kafe.
- ❌ **Miskomunikasi Shift**: Selisih stok kopi & uang kas antara kasir dan barista saat tutup toko.

**Solusi KopiPOS**:
- ✅ **100% Offline-First**: Kasir tetap jualan, cetak struk, dan buka laci kas tanpa internet menggunakan SQLite lokal. Data tersinkronisasi otomatis saat online lewat *Transactional Outbox Pattern*.
- ✅ **KDS LAN WebSocket (<50ms)**: Pesanan kasir langsung muncul di layar tablet barista di jaringan Wi-Fi lokal tanpa internet.
- ✅ **Multi-Tenant White-Label**: Warna tema, logo, format struk, dan denah meja bisa diatur sesuai branding masing-masing kafe.
- ✅ **Struk Thermal Harian (EOD)**: Mencatat roster kasir & barista bertugas per shift serta estimasi pemakaian bahan baku (biji kopi, susu oat, cup) untuk mencegah saling tuduh.

---

## 🏗️ Arsitektur & Struktur Monorepo

Proyek ini menggunakan arsitektur **Turborepo Monorepo** berbasis `pnpm`:

```
d:\CHACE\Pemikiran\
├── apps/
│   ├── pos/                  # [DESKTOP] Aplikasi Kasir & KDS (Electron 33 + React 19 + SQLite)
│   ├── api/                  # [CLOUD] Backend Server & Lisensi (Node.js + Fastify + PostgreSQL)
│   └── admin/                # [WEB] Vendor Hub Dashboard (Next.js 15 + Tailwind CSS)
│
├── packages/
│   ├── shared-types/         # Definisi TypeScript bersama (Tenant, License, Order, Report)
│   └── shared-utils/         # Utilitas Format Rupiah, Pajak PPN 11%, UUID, Invoice Gen
│
├── DOKUMEN_MASTER_KOPIPOS.md # Spesifikasi Lengkap Produk, Desain & Sistem Laporan
├── package.json              # Root Monorepo Configuration
├── pnpm-workspace.yaml       # Pnpm Workspace Defs
├── turbo.json                # Turborepo Build Pipelines
└── .gitignore
```

---

## 🚀 Panduan Setup & Menjalankan (Di Mana Saja)

Ikuti langkah-langkah ini saat Anda clone repository ini di laptop atau komputer baru:

### 1. Prasyarat Sistem
- **Node.js**: Versi `>= 20.0.0` ([Unduh Node.js LTS](https://nodejs.org/))
- **Pnpm**: Versi `>= 9.0.0`
  ```bash
  npm install -g pnpm
  ```
- **Git**: Untuk cloning repository

### 2. Clone & Install Dependencies
```bash
# Clone repository
git clone <URL_REPO_GITHUB_ANDA>
cd Pemikiran

# Install seluruh dependency monorepo (pos, api, admin, packages)
pnpm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` di root atau masing-masing folder aplikasi:
```bash
cp .env.example .env
```
Contoh isi `.env`:
```env
# Cloud API
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kopipos"
JWT_SECRET="kopipos_super_secret_jwt_key_2026"
API_PORT=3001

# POS Desktop
POS_API_URL="http://localhost:3001"
KDS_WS_PORT=8080
```

### 4. Menjalankan Aplikasi dalam Mode Development

Anda bisa menjalankan aplikasi secara terpisah atau bersamaan:

#### A. Menjalankan Kasir Desktop (POS Electron + React)
```bash
pnpm dev:pos
```
> Aplikasi kasir desktop akan terbuka otomatis dalam window Electron.

#### B. Menjalankan Vendor Admin Dashboard (Web Next.js)
```bash
pnpm dev:admin
```
> Buka browser di [http://localhost:3000](http://localhost:3000) untuk mengakses dasbor pemilik platform.

#### C. Menjalankan Cloud API Backend (Fastify)
```bash
pnpm dev:api
```
> Server backend berjalan di [http://localhost:3001](http://localhost:3001).

---

### 🐳 5. Menjalankan dengan Docker (1-Command Deployment)

Jika Anda tidak ingin menginstall PostgreSQL atau ingin langsung mendeploy seluruh backend cloud ke server/VPS:

#### Opsi A: Jalankan Seluruh Cloud Stack (PostgreSQL + API + Admin Web)
```bash
# Build dan jalankan seluruh cloud services di background
docker compose up -d --build

# Cek logs
docker compose logs -f
```
Layanan yang akan aktif otomatis:
- 🌐 **Vendor Admin Hub**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Cloud Backend API**: [http://localhost:3001](http://localhost:3001)
- 🗄️ **PostgreSQL 16**: `localhost:5432` (database `kopipos`)

#### Opsi B: Jalankan PostgreSQL Saja untuk Development Lokal
Jika Anda ingin coding aplikasi secara langsung (`pnpm dev:pos` / `pnpm dev:admin`), cukup jalankan database-nya saja via Docker:
```bash
docker compose -f docker-compose.dev.yml up -d
```

> **Catatan Penting**: Aplikasi Kasir Desktop (`apps/pos`) adalah aplikasi Electron yang berjalan langsung di sistem operasi komputer kasir (Windows/Mac/Linux) agar dapat berkomunikasi langsung dengan printer thermal dan laci kas. Cloud API dan Vendor Hub berjalan di dalam Docker.

---

## 📊 Status Fitur: Selesai vs Belum Dibuat (Roadmap)

Gunakan tabel ini sebagai panduan saat Anda ingin melanjutkan pengembangan di mana saja:

### 1. Aplikasi Kasir Desktop (`apps/pos`)
| Fitur | Status | Catatan Teknis |
|---|:---:|---|
| Layar Aktivasi Lisensi (`/activate`) | ✅ Selesai | Auto-hyphenation `KPOS-XXXX-XXXX-XXXX` + machine fingerprint |
| Layar Login Staff PIN (`/login`) | ✅ Selesai | Keypad numerik 4 digit, error shake, profil staff cepat |
| Layar Kasir Utama (`/`) | ✅ Selesai | Menu grid, pencarian cepat, speed dial favorit, panel cart |
| Modal Varian & Modifier Menu | ✅ Selesai | Pilihan cup (Regular/Large), susu (Oat/Fresh), gula, es, notes |
| Dialog Pembayaran Multi-Metode | ✅ Selesai | Cash (hitung kembalian otomatis), QRIS dinamis, Debit, E-Wallet |
| Kitchen Display System (`/kitchen`) | ✅ Selesai | 3 Kolom Kanban (Pending, In Progress, Ready), filter stasiun bar |
| Portal Laporan Owner (`/reports`) | ✅ Selesai | Switcher Harian, Mingguan, Bulanan + Tombol cetak thermal harian |
| Manajemen Shift Kasir (`/shift`) | ✅ Selesai | Buka shift (kas awal), Tutup shift (rekonsiliasi kas aktual & selisih) |
| Kustomisasi & Branding Kafe (`/settings`) | ✅ Selesai | Custom warna tema hex, upload logo, format info Wi-Fi di struk |
| Driver Thermal Printer ESC/POS | ✅ Selesai | Byte formatting 80mm/58mm, customer receipt, Z-Report, Daily EOD |
| Tendangan Laci Kas (*Cash Drawer Kick*) | ✅ Selesai | Perintah ESC/POS `\x1b\x70\x00\x19\xfa` pada Pin 2 |
| Server KDS LAN WebSocket (Port 8080) | ✅ Selesai | Real-time broadcast tiket baru & bump status dari tablet barista |
| Offline Outbox Sync Worker | ✅ Selesai | Polling 15 detik, push batch SQLite ke PostgreSQL saat online |
| *Barcode Scanner USB listener* | ⏳ Belum | Event listener serial/HID barcode untuk produk ber-barcode |
| *Electron Windows Installer (.exe / MSI)* | ⏳ Belum | Konfigurasi `electron-builder` untuk build installer production |

### 2. Vendor Admin Dashboard (`apps/admin`)
| Fitur | Status | Catatan Teknis |
|---|:---:|---|
| App Shell & Sidebar SaaS | ✅ Selesai | Desain clean dark navy `#1a1a2e` dan aksen coral `#e94560` |
| Executive Overview Dashboard (`/`) | ✅ Selesai | 4 KPI: Total Tenants, Active Today, MRR, Expiring Soon, tabel kafe |
| Manajemen Kafe Klien (`/tenants`) | ✅ Selesai | Modal pendaftaran kafe baru, pilih paket (Basic/Pro/Enterprise) |
| Pusat Lisensi Klien (`/licenses`) | ✅ Selesai | Generator 1-klik `KPOS-XXXX-XXXX-XXXX`, copy key, extend, revoke |
| Billing & WhatsApp Reminder (`/billing`)| ✅ Selesai | Tracking tagihan invoice + shortcut kirim chat WA otomatis |
| *Export Laporan Vendor ke PDF* | ⏳ Belum | Download laporan performa vendor format PDF |
| *Payment Gateway Langganan Otomatis* | ⏳ Belum | Integrasi Midtrans / Xendit untuk auto-charge langganan kafe |

### 3. Cloud Backend API (`apps/api`)
| Fitur | Status | Catatan Teknis |
|---|:---:|---|
| Fastify Server & Router | ✅ Selesai | Node.js Fastify + TypeScript setup |
| Skema Database PostgreSQL (Drizzle ORM) | ✅ Selesai | 8 tabel: tenants, outlets, licenses, users, sync_events, subscriptions |
| Service Generator Lisensi RSA | ✅ Selesai | Validasi format lisensi, pengecekan expiry, dan revokasi |
| Ingestion Endpoint Sync (`/api/sync/push`)| ✅ Selesai | Menerima batch outbox event dari kasir offline |
| *Ekspor CSV e-Faktur Pajak DJP* | ⏳ Belum | Generator format CSV resmi e-Faktur untuk pelaporan PPN |

---

## ⚡ Daftar Perintah (Cheatsheet)

```bash
# Menjalankan Semua Project Sekaligus (Turborepo)
pnpm dev

# Menjalankan Aplikasi Spesifik
pnpm dev:pos      # Kasir Desktop Electron
pnpm dev:admin    # Vendor Web Dashboard Next.js
pnpm dev:api      # Cloud API Fastify

# Build Semua Project
pnpm build

# Migrasi Database Cloud (PostgreSQL)
pnpm db:migrate

# Seed Data Awal Kafe
pnpm db:seed
```

---

## 📚 Dokumentasi Lengkap Terkait

Untuk detail teknis, desain karakter per karakter struk, dan arsitektur database, buka file berikut di repo ini:
- **[DOKUMEN_MASTER_KOPIPOS.md](./DOKUMEN_MASTER_KOPIPOS.md)**: Dokumen spesifikasi produk resmi, USP, dan alur bisnis.
- **[task.md](./task.md)** (di artifacts): Checklist sprint terperinci.

---
*KopiPOS SaaS — Dirancang untuk kecepatan, keandalan offline, dan kemudahan bisnis kafe.*
