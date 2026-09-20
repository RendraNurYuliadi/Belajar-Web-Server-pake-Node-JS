# 📋 Dokumentasi & Status Proyek (Fullstack React + Express + MongoDB)

Dokumen ini merangkum arsitektur, teknologi, database, middleware, dan kondisi terkini dari proyek untuk referensi pengembangan selanjutnya.

---

## 1. Ringkasan Proyek (Overview)
Aplikasi web fullstack modern dengan arsitektur **API-First (Headless)**:
* **Frontend (FE)**: Dibangun dengan **React 19**, **React Router v7** (Multi-page SPA), di-bundle oleh **Vite**, dan distyling dengan **Tailwind CSS v4**.
* **Backend (BE)**: Dibangun dengan **Express.js v5**, **Mongoose v9**, autentikasi **JWT**, dan **Bcrypt.js**.
* **Database**: **MongoDB Atlas (Cloud)** (`Cluster0.belajar` Singapore), koleksi `users` & `products`.
* **Keamanan**: Dilindungi oleh **Middleware Autentikasi JWT** di backend dan **ProtectedRoute** di frontend (mirip `middleware('auth')` di Laravel).

---

## 2. Tech Stack & Dependencies
* **Frontend**:
  * `react` & `react-dom` (v19.x)
  * `react-router-dom` (v7.x)
  * `@tailwindcss/vite` & `tailwindcss` (v4.x)
  * `vite` (v8.x)
* **Backend**:
  * `express` (v5.x)
  * `mongoose` (v9.x) - ODM untuk MongoDB
  * `jsonwebtoken` (v9.x) - Membuat & memvalidasi token JWT
  * `bcryptjs` (v3.x) - Hashing password aman
  * `cors` (v2.x) - Mengizinkan komunikasi lintas origin
  * `dotenv` (v18.x) - Mengelola environment variables (.env)
* **Development Tools**:
  * `nodemon` (v3.x) - Hot-reload server Express
  * `concurrently` (v10.x) - Menjalankan dev server FE dan BE dalam 1 perintah

---

## 3. Struktur Direktori Proyek
```text
Belajar Web Server pake Node JS/
├── .env                       # Konfigurasi PORT, MONGO_URI, dan JWT_SECRET
├── app.js                     # Backend API Express (Koneksi MongoDB & Routes)
├── models/
│   └── User.js                # Schema Mongoose untuk collection 'users'
├── middleware/
│   └── auth.js                # Middleware verifyToken & adminOnly
├── package.json
├── vite.config.mjs
└── src/
    ├── main.jsx               # Entry point React
    ├── App.jsx                # Routing React Router + ProtectedRoute
    ├── components/
    │   ├── ProtectedRoute.jsx # Pelindung halaman private di client-side
    │   ├── Sidebar.jsx        # Navigasi sidebar dinamis + info user MongoDB
    │   └── Navbar.jsx
    └── pages/
        ├── Login.jsx          # Form login terintegrasi ke POST /api/auth/login
        ├── Register.jsx       # Form register akun baru
        └── Dashboard.jsx      # Dashboard admin + data tabel users MongoDB
```

---

## 4. Skema Database MongoDB (`belajar`)

### Koleksi `users`:
```json
{
  "_id": "6aafe7535167d0f37a84bc5b",
  "name": "Rendra",
  "email": "rendra@gmail.com",
  "password": "...",
  "role": "admin",
  "isActive": true,
  "age": 21
}
```

### Koleksi `products`:
```json
{
  "_id": "6aaffb125167d0f37a84bc67",
  "name": "Mechanical Keyboard",
  "description": "Keyboard mechanical RGB untuk gaming dan coding",
  "price": 750000,
  "category": "Accessories",
  "stock": 15,
  "isActive": true
}
```

---

## 5. Endpoints API Backend (`app.js`)

| Method | Endpoint | Middleware | Keterangan |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Validasi email & password, mengembalikan token JWT |
| `POST` | `/api/auth/register` | Publik | Mendaftarkan user baru ke MongoDB dengan password hash |
| `GET` | `/api/auth/me` | `verifyToken` | Mengambil data profil user dari token JWT |
| `GET` | `/api/users` | `verifyToken`, `adminOnly` | Mengambil semua pengguna dari MongoDB (Read) |
| `POST` | `/api/users` | `verifyToken`, `adminOnly` | Menambahkan pengguna baru ke MongoDB (Create) |
| `PUT` | `/api/users/:id` | `verifyToken`, `adminOnly` | Memperbarui data pengguna di MongoDB (Update) |
| `DELETE` | `/api/users/:id` | `verifyToken`, `adminOnly` | Menghapus akun pengguna dari MongoDB (Delete) |
| `GET` | `/api/products` | `verifyToken` | Mengambil semua katalog produk dari MongoDB |
| `POST` | `/api/products` | `verifyToken` | Menambahkan produk baru ke MongoDB |
| `PUT` | `/api/products/:id` | `verifyToken` | Memperbarui data produk di MongoDB |
| `DELETE` | `/api/products/:id` | `verifyToken` | Menghapus produk dari katalog MongoDB |
| `GET` | `/api/stats/dashboard` | `verifyToken` | Ringkasan statistik real-time untuk Beranda |
| `GET` | `/api/status` | Publik | Cek kesehatan server & status koneksi MongoDB |

---

## 6. Cara Menjalankan Proyek

Pastikan MongoDB service lokal Anda sedang aktif di `mongodb://127.0.0.1:27017/`, lalu jalankan:

```bash
npm run dev
```

1. Buka browser di **[http://localhost:5173](http://localhost:5173)**.
2. Login menggunakan akun MongoDB:
   * **Email**: `rendra@gmail.com`
   * **Password**: `123456`
3. Masuk ke Dashboard, lalu klik menu **Pengguna** di sidebar untuk melihat data user yang diambil langsung dari database MongoDB melalui Express Middleware.
