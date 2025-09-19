# AS Denim - Dashboard Admin

Dashboard admin untuk toko online AS Denim yang dibangun dengan React.js. Aplikasi ini menyediakan antarmuka untuk mengelola produk, kategori, pesanan, pengiriman, pengguna, dan laporan penjualan dengan desain yang responsif menggunakan Tailwind CSS.

## Fitur Utama

- **Dashboard**: Ringkasan data penjualan, pesanan, pengguna, dan produk dengan grafik interaktif
- **Manajemen Produk**: CRUD produk dengan upload gambar dan editor rich text untuk deskripsi
- **Manajemen Kategori**: Kelola kategori produk dengan gambar
- **Manajemen Pesanan**: Lihat dan update status pesanan pelanggan
- **Manajemen Pengiriman**: Kelola data pengiriman dan tracking
- **Manajemen Pembayaran**: Monitor status pembayaran pelanggan
- **Manajemen Pengguna**: Kelola akun pengguna dan status aktivasi
- **Manajemen Admin**: CRUD akun admin dengan berbagai level akses
- **Laporan Penjualan**: Generate laporan dengan export PDF
- **Profil Admin**: Edit profil dan informasi akun admin

## Teknologi yang Digunakan

- **React 18** - Library frontend utama
- **Vite** - Build tool dan development server
- **React Router DOM** - Routing aplikasi
- **Tailwind CSS** - Framework CSS untuk styling
- **React Data Table Component** - Komponen tabel data
- **React Quill** - Rich text editor
- **React Icons** - Icon library
- **React Toastify** - Notifikasi toast
- **Recharts** - Library chart untuk dashboard
- **jsPDF & jsPDF-AutoTable** - Generate laporan PDF
- **PropTypes** - Type checking untuk React components

## Struktur Proyek

```
src/
├── assets/          # Gambar dan asset statis
├── components/      # Komponen React reusable
│   ├── Dashboard/   # Komponen khusus dashboard
│   ├── Product/     # Komponen manajemen produk
│   ├── Category/    # Komponen manajemen kategori
│   ├── Order/       # Komponen manajemen pesanan
│   ├── Shipment/    # Komponen manajemen pengiriman
│   ├── Payment/     # Komponen manajemen pembayaran
│   ├── User/        # Komponen manajemen pengguna
│   ├── Admin/       # Komponen manajemen admin
│   ├── Profile/     # Komponen profil admin
│   └── Review/      # Komponen ulasan produk
├── context/         # React Context untuk state management
├── pages/           # Halaman utama aplikasi
├── services/        # API service functions
├── utils/           # Utility functions
├── App.jsx          # Komponen utama aplikasi
└── main.jsx         # Entry point aplikasi
```

## Instalasi dan Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd toko-online-as-denim-admin-user
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit file `.env` dan sesuaikan `VITE_API_BASE_URL` dengan URL backend API.

4. **Jalankan development server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5174`

## Scripts Tersedia

- `npm run dev` - Menjalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm run preview` - Preview build production
- `npm run lint` - Jalankan ESLint untuk code linting

## Konfigurasi Environment

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Fitur Keamanan

- Autentikasi admin dengan Laravel Sanctum
- Protected routes untuk halaman admin
- Auto logout saat token expired
- Validasi input dengan error handling
- CSRF protection melalui API headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


