# ⚡ Belajar Web Server pake Node JS (Fullstack React + Express + MongoDB Atlas)

Aplikasi Fullstack Web App modern yang menggabungkan **React 19** (Vite + Tailwind CSS v4) dan **Express.js v5 REST API** dengan database cloud **MongoDB Atlas**. Dibangun untuk kemudahan deploy all-in-one di **Vercel** (Serverless Function).

---

## 🚀 Fitur Utama
* **Autentikasi & Otorisasi**:
  * Login dengan token **JWT (JSON Web Token)**.
  * Hashing password aman menggunakan **Bcrypt.js**.
  * **Role-Based Access Control (RBAC)**: Menu sidebar dan route sensitif otomatis tersembunyi jika bukan Admin.
  * **Protected Routes** di client-side menggunakan `react-router-dom`.
* **Koneksi Database Cloud**:
  * Terhubung langsung ke **MongoDB Atlas (Singapore Cluster)** menggunakan **Mongoose v9**.
* **CRUD Manajemen Pengguna (`users`)**:
  * Tambah, lihat, ubah, dan hapus user langsung ke MongoDB.
  * Validasi dilarang menghapus akun sendiri yang sedang aktif.
  * Pencarian dan filter instan.
* **CRUD Manajemen Produk (`products`)**:
  * Kelola katalog produk: nama, deskripsi, kategori, format harga Rupiah, dan stok.
  * Filter kategori dan live search.
* **Dashboard Real-time**:
  * Menghitung total user, total produk, stok unit, dan estimasi nilai aset secara live dari database.
* **Vercel Ready**:
  * Arsitektur monorepo serverless: Frontend React & Backend Express berjalan dalam 1 domain di Vercel tanpa masalah CORS!

---

## 🛠️ Tech Stack
* **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7
* **Backend**: Express.js v5, Mongoose v9, JSON Web Token (JWT), Bcrypt.js, CORS, Dotenv
* **Database**: MongoDB Atlas (Cloud)
* **Deployment**: Vercel (Serverless Functions)

---

## ⚙️ Cara Menjalankan Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/RendraNurYuliandi/Belajar-Web-Server-pake-Node-JS.git
   cd Belajar-Web-Server-pake-Node-JS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup file `.env`:**
   Buat file `.env` di folder root:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.0lqwefq.mongodb.net/belajar?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=rahasia_super_aman_jwt_123
   ```

4. **Jalankan aplikasi (Frontend + Backend bersamaan):**
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend API: `http://localhost:5000`

---

## ☁️ Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** ➜ **Project**.
3. Import repository: `RendraNurYuliandi/Belajar-Web-Server-pake-Node-JS`.
4. Di bagian **Environment Variables**, tambahkan:
   * `MONGO_URI` : *(Connection string MongoDB Atlas Anda)*
   * `JWT_SECRET` : *(Secret key JWT Anda)*
5. Klik **Deploy**! Selesai! 🎉
