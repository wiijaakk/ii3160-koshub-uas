# KosHub - Platform Terintegrasi untuk Akomodasi & Layanan Pendukung Kehidupan

**Tugas 3 - Integrasi Layanan (II3160 UAS)**

KosHub adalah platform web komprehensif yang mengintegrasikan dua microservices: **Pemesanan Akomodasi** dan **Layanan Pendukung Kehidupan**. Dibangun dengan teknologi web modern dan prinsip Domain-Driven Design (DDD), KosHub menyediakan pengalaman yang mulus bagi mahasiswa dan penghuni kos untuk menemukan akomodasi dan mengelola layanan kehidupan sehari-hari.

## Fitur

### Konteks Pemesanan Akomodasi
- Telusuri akomodasi kos yang tersedia
- Autentikasi dan registrasi pengguna
- Sistem diskon berbasis keanggotaan (BASIC, SILVER 5%, GOLD 10%)
- Pemesanan berbasis tanggal dengan pelacakan ketersediaan
- Kalkulasi diskon otomatis

### Konteks Layanan Pendukung Kehidupan
- **Layanan Laundry**
  - Berbagai jenis layanan (Cuci, Cuci+Setrika, Dry Clean, Setrika Saja)
  - Harga berbasis berat
  - Penjadwalan penjemputan dan pengiriman
  - Pelacakan pesanan real-time

- **Layanan Catering**
  - Kategori makanan (Sarapan, Makan Siang, Makan Malam, Snack)
  - Pemilihan menu yang dapat disesuaikan
  - Dukungan permintaan khusus
  - Penjadwalan pengiriman

### Fitur Tambahan
- Sistem notifikasi real-time
- Dashboard pengguna untuk mengelola pemesanan dan layanan
- Desain yang sepenuhnya responsif
- UI modern dengan palet warna pink/merah kustom
- Cepat dan dioptimalkan dengan Next.js 16

## Arsitektur

KosHub mengimplementasikan **Domain-Driven Design (DDD)** dengan bounded context yang jelas:

### Mengapa DDD?

Sistem ini memiliki domain bisnis yang berbeda dengan karakteristik yang berbeda:
1. **Pemesanan Akomodasi** - Berfokus pada ketersediaan kamar, harga, dan reservasi
2. **Layanan Pendukung Kehidupan** - Berfokus pada pengiriman layanan harian dan manajemen pesanan

Setiap domain memiliki:
- Logika dan aturan bisnis sendiri
- Model data sendiri
- Manajemen lifecycle sendiri
- Skalabilitas independen

## Stack Teknologi

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Penanganan Tanggal**: date-fns

### Backend Services
- **Accommodation Service**: Express.js + PostgreSQL (Supabase)
  - URL: `http://18223088.tesatepadang.space`
  - Autentikasi dengan Supabase Auth

- **Living Support Service**: Express.js + PostgreSQL (Supabase)
  - URL: `http://18223054.tesatepadang.space`
  - Manajemen pesanan layanan

## Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda memiliki:

- Node.js 20+ terinstal
- npm atau yarn package manager
- Koneksi internet (untuk mengakses backend API yang sudah di-deploy)

## Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd II3160-UAS-KosHub/koshub
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Environment** (Opsional)

Aplikasi dikonfigurasi untuk menggunakan backend services yang sudah di-deploy. Jika Anda perlu mengubah API endpoints, buat file `.env.local`:

```env
NEXT_PUBLIC_ACCOMMODATION_API=http://18223088.tesatepadang.space
NEXT_PUBLIC_LIVING_SUPPORT_API=http://18223054.tesatepadang.space
```

## Menjalankan Aplikasi

### Mode Development
```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Struktur Proyek

```
koshub/
├── app/
│   ├── accommodations/         # Pencarian & pemesanan akomodasi
│   │   └── page.tsx
│   ├── auth/                   # Halaman autentikasi
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── components/             # Komponen UI yang dapat digunakan ulang
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/              # Dashboard pengguna
│   │   └── page.tsx
│   ├── lib/                    # Utilities dan services
│   │   ├── api.ts             # API service layer
│   │   └── AuthContext.tsx    # Authentication context
│   ├── services/               # Layanan pendukung kehidupan
│   │   └── page.tsx
│   ├── types/                  # Definisi tipe TypeScript
│   │   └── index.ts
│   ├── globals.css            # Styles global dengan palet warna
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Integrasi Layanan

### Accommodation Service (18223088)

**Authentication**
- POST `/authenticate/login` - Login pengguna
- POST `/authenticate/register` - Registrasi pengguna
- PUT `/authenticate/change-password` - Ubah password

**Accommodations**
- GET `/accommodations` - Daftar semua akomodasi yang tersedia
- GET `/accommodations/:id` - Detail akomodasi
- POST `/accommodations` - Buat akomodasi baru
- PUT `/accommodations/:id` - Update akomodasi
- DELETE `/accommodations/:id` - Hapus akomodasi

**Bookings**
- GET `/bookings` - Dapatkan pemesanan pengguna (memerlukan auth)
- POST `/bookings` - Buat pemesanan baru (memerlukan auth)
- GET `/bookings/:id` - Detail pemesanan
- PUT `/bookings/:id` - Update status pemesanan
- DELETE `/bookings/:id` - Batalkan pemesanan

### Living Support Service (18223054)

**Laundry**
- GET `/laundry` - Dapatkan pesanan laundry pengguna
- POST `/laundry` - Buat pesanan laundry
- GET `/laundry/:id` - Detail pesanan
- PUT `/laundry/:id` - Update pesanan laundry
- PUT `/laundry/:id/status` - Update status pesanan
- DELETE `/laundry/:id` - Batalkan pesanan laundry

**Catering**
- GET `/catering/menu` - Dapatkan menu catering
- GET `/catering` - Dapatkan pesanan catering pengguna
- POST `/catering` - Buat pesanan catering
- GET `/catering/:id` - Detail pesanan
- PUT `/catering/:id` - Update pesanan catering
- PUT `/catering/:id/status` - Update status pesanan
- DELETE `/catering/:id` - Batalkan pesanan catering

**Notifications**
- GET `/notifications` - Dapatkan notifikasi pengguna
- GET `/notifications/unread-count` - Dapatkan jumlah belum dibaca
- PUT `/notifications/:id/read` - Tandai sebagai dibaca
- PUT `/notifications/read-all` - Tandai semua sebagai dibaca

## Screenshot

### Homepage
Landing page modern dengan overview layanan dan penjelasan arsitektur DDD.

### Pencarian Akomodasi
Telusuri kos yang tersedia dengan ketersediaan real-time, harga, dan diskon keanggotaan.

### Autentikasi
Login dan registrasi yang aman dengan pemilihan level keanggotaan.

### Dashboard Pengguna
Dashboard terpusat untuk mengelola semua pemesanan dan pesanan layanan.

### Layanan
Halaman khusus untuk layanan laundry dan catering dengan pemesanan yang mudah.

## Tim

- **Mahasiswa 18223088** - Developer Accommodation Service
- **Mahasiswa 18223054** - Developer Living Support Service

## Detail Tugas

**Mata Kuliah**: II3160 - Teknologi Sistem Terintegrasi
**Tugas**: UAS - Tugas 3 (Integrasi Layanan)
**Institusi**: Institut Teknologi Bandung

**Dibuat untuk II3160 UAS - KosHub**
