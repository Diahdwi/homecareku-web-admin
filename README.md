# 🏥 Homecareku - Web Admin Dashboard

Repository ini merupakan bagian dari ekosistem aplikasi **Homecareku** (Layanan Kesehatan Panggil ke Rumah) yang dikhususkan untuk peran **Admin**. Aplikasi berbasis web ini dibangun menggunakan **React.js** dan terintegrasi langsung dengan **Firebase Firestore**.

## 🚀 Fitur Utama Web Admin
* **Dashboard Ringkasan:** Menampilkan total pendapatan, jumlah transaksi, dan statistik layanan.
* **Manajemen Layanan (CRUD):** Menambah, mengubah, atau menghapus jenis layanan kesehatan/homecare yang tersedia.
* **Manajemen Perawat:** Mengatur jadwal *shift (on/off)* perawat secara real-time.
* **Pembukuan & Transaksi:** Melihat seluruh riwayat transaksi, filter keuangan, dan rekapitulasi data.

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite)
* **Styling:** TailwindCSS
* **Database:** Firebase Firestore
* **Routing:** React Router DOM v6
* **Icons:** Lucide React

## 📦 Prasyarat Instalasi
Sebelum menjalankan project ini, pastikan kamu sudah menginstall:
* [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
* NPM (Otomatis terinstall bersama Node.js)

## 🔧 Langkah Instalasi & Menjalankan Project

1. **Clone Repository ini:**
   ```bash
   git clone [https://github.com/username-kamu/homecareku-web-admin.git](https://github.com/username-kamu/homecareku-web-admin.git)
   cd homecareku-web-admin


struktur folder
src/
├── config/
│   └── firebase.js       # Konfigurasi koneksi ke Firestore
├── components/           # Komponen reusable (Sidebar, Navbar, Card, dll)
│   ├── Sidebar.jsx
│   └── Navbar.jsx
├── pages/                # Halaman Utama Admin
│   ├── Dashboard.jsx     # Ringkasan pembukuan & totalan
│   ├── Layanan.jsx       # CRUD Edit/Tambah Layanan
│   ├── Perawat.jsx       # Atur shift jadwal perawat
│   └── Transaksi.jsx     # Riwayat pembukuan/transaksi
├── App.jsx
└── main.jsx

## 👥 Tim Pengembang

| Nama | NIM | Peran |
| :--- | :--- | :--- |
| Abyan Faza Nariswangga | 4.33.24.2.01 | Full-Stack Developer |
| Diah Dwi Astuti  | 4.33.24.2.07 | Full-Stack Developer |
| Izza Baghuz Syafi'i Ma'arif | 4.33.24.2.11 | Full-Stack Developer |
| Zalfa Az Zahra | 4.33.24.2.24 | Full-Stack Developer |

---

## 👨‍🏫 Dosen Pembimbing

*   **Suko Tyas Pernanda, S.ST., M.Cs** (Dosen Pembimbing Utama)
*   **Wiktasari, S.T., M.Kom** (Dosen Pembimbing Pendamping)

---

<div align="center">
  <b>PBL Kelompok 6 — Homecareku</b><br>
  Program Studi D4 Teknologi Rekayasa Komputer<br>
  Jurusan Elektro<br>
  Politeknik Negeri Semarang<br>
  Semester Genap 2025/2026
</div>