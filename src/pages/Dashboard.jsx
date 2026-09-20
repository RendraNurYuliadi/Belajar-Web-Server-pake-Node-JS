import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Format Rupiah helper
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
};

// Konten dasar masing-masing menu
const contentMap = {
  beranda: {
    title: 'Beranda',
    icon: '🏠',
  },
  produk: {
    title: 'Manajemen Produk (CRUD MongoDB)',
    icon: '📦',
    description: 'Kelola inventaris dan katalog produk toko langsung di koleksi products MongoDB.',
  },
  pengguna: {
    title: 'Manajemen Pengguna (CRUD MongoDB)',
    icon: '👥',
    description: 'Kelola akun pengguna langsung di database MongoDB lokal melalui Express Middleware.',
  },
  laporan: {
    title: 'Laporan & Statistik',
    icon: '📊',
    description: 'Lihat ringkasan dan performa bisnis dari data MongoDB.',
  },
  pengaturan: {
    title: 'Pengaturan Akun',
    icon: '⚙️',
    description: 'Atur konfigurasi aplikasi dan profil Anda.',
  },
};

export default function Dashboard() {
  const { menu = 'beranda' } = useParams();
  const content = contentMap[menu] || contentMap['beranda'];

  // Notifikasi Feedback Global
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // ----------------------------------------------------
  // STATE BERANDA & STATS DARI BACKEND
  // ----------------------------------------------------
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
  });

  // ----------------------------------------------------
  // STATE USERS (PENGGUNA)
  // ----------------------------------------------------
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userModalLoading, setUserModalLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    age: 20,
    isActive: true,
  });

  // ----------------------------------------------------
  // STATE PRODUCTS (PRODUK)
  // ----------------------------------------------------
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('Semua');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productModalLoading, setProductModalLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Accessories',
    stock: 10,
    isActive: true,
  });

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const token = localStorage.getItem('token');

  // Fetch Statistik Beranda
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Gagal fetch stats:', err);
    }
  };

  // Fetch Daftar Pengguna
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat pengguna');
      }
      setUsersList(data.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Daftar Produk
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat produk');
      }
      setProductsList(data.data || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProductsLoading(false);
    }
  };

  // Refresh data sesuai menu aktif
  useEffect(() => {
    if (menu === 'beranda') {
      fetchStats();
    } else if (menu === 'pengguna' && currentUser.role === 'admin') {
      fetchUsers();
    } else if (menu === 'produk') {
      fetchProducts();
    }
  }, [menu, currentUser.role]);

  // ==========================================
  // HANDLERS USER CRUD
  // ==========================================
  const handleOpenAddUser = () => {
    setIsEditingUser(false);
    setSelectedUserId(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      age: 20,
      isActive: true,
    });
    setFeedback({ type: '', message: '' });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setIsEditingUser(true);
    setSelectedUserId(u._id);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      age: u.age || 20,
      isActive: u.isActive !== undefined ? u.isActive : true,
    });
    setFeedback({ type: '', message: '' });
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserModalLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const url = isEditingUser
        ? `/api/users/${selectedUserId}`
        : '/api/users';
      const method = isEditingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan user');
      }

      setFeedback({
        type: 'success',
        message: isEditingUser ? 'Pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!',
      });
      setUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (currentUser.id === u._id) {
      alert('Tidak bisa menghapus akun Anda sendiri yang sedang digunakan!');
      return;
    }

    if (!window.confirm(`Hapus user "${u.name}" dari MongoDB?`)) return;

    try {
      const res = await fetch(`/api/users/${u._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setFeedback({ type: 'success', message: `User "${u.name}" berhasil dihapus!` });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // ==========================================
  // HANDLERS PRODUCT CRUD
  // ==========================================
  const handleOpenAddProduct = () => {
    setIsEditingProduct(false);
    setSelectedProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: 100000,
      category: 'Accessories',
      stock: 10,
      isActive: true,
    });
    setFeedback({ type: '', message: '' });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p) => {
    setIsEditingProduct(true);
    setSelectedProductId(p._id);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || 0,
      category: p.category || 'Accessories',
      stock: p.stock || 0,
      isActive: p.isActive !== undefined ? p.isActive : true,
    });
    setFeedback({ type: '', message: '' });
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductModalLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const url = isEditingProduct
        ? `/api/products/${selectedProductId}`
        : '/api/products';
      const method = isEditingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan produk');
      }

      setFeedback({
        type: 'success',
        message: isEditingProduct ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan ke MongoDB!',
      });
      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProductModalLoading(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Hapus produk "${p.name}" dari katalog MongoDB?`)) return;

    try {
      const res = await fetch(`/api/products/${p._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setFeedback({ type: 'success', message: `Produk "${p.name}" berhasil dihapus!` });
      fetchProducts();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Filter Pengguna
  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter Produk
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'Semua' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['Semua', ...new Set(productsList.map((p) => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Komponen Sidebar */}
      <Sidebar />

      {/* Area Konten Utama */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold text-white">{content.icon} {content.title}</h2>
            <p className="text-[11px] text-slate-500 font-mono">/dashboard/{menu}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-mono">
              MongoDB Atlas Cloud: <code className="text-emerald-400">belajar.{menu === 'produk' ? 'products' : 'users'}</code>
            </span>
          </div>
        </header>

        {/* Konten Halaman */}
        <div className="p-8 flex-1">
          {/* Alert Notifikasi Global */}
          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback({ type: '', message: '' })}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: BERANDA                                           */}
          {/* ======================================================== */}
          {menu === 'beranda' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-black text-white">Selamat Datang 👋</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Data berikut ditarik secara dinamis dari database MongoDB lokal Anda (<code className="text-cyan-400">belajar</code>).
                </p>
              </div>

              {/* Grid 4 Kartu Statistik Real-time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Total Akun Pengguna</p>
                  <p className="text-3xl font-black mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {stats.totalUsers} User
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Koleksi <code className="text-cyan-300">users</code></p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Total Jenis Produk</p>
                  <p className="text-3xl font-black mt-2 bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                    {stats.totalProducts} Item
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Koleksi <code className="text-emerald-300">products</code></p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Total Stok Inventaris</p>
                  <p className="text-3xl font-black mt-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {stats.totalStock} Unit
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Siap dikirim ke pelanggan</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Estimasi Nilai Stok</p>
                  <p className="text-2xl font-black mt-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    {formatRupiah(stats.totalValue)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Total harga x stok</p>
                </div>
              </div>

              {/* Status Sistem */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2">⚡ Status Arsitektur Fullstack</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <p className="text-slate-500">Database</p>
                    <p className="text-emerald-400 font-bold mt-1">MongoDB Atlas (Cloud)</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cluster0 (Singapore) • Online</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <p className="text-slate-500">Backend API</p>
                    <p className="text-cyan-400 font-bold mt-1">Express v5 + Mongoose</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">verifyToken & adminOnly</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <p className="text-slate-500">Frontend Client</p>
                    <p className="text-blue-400 font-bold mt-1">React 19 + Tailwind v4</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">SPA + Fast Transitions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MANAJEMEN PRODUK (CRUD)                           */}
          {/* ======================================================== */}
          {menu === 'produk' && (
            <div className="max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-white">{content.icon} {content.title}</h1>
                  <p className="text-slate-400 text-sm mt-1">{content.description}</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>➕</span> Tambah Produk
                </button>
              </div>

              {/* Bar Filter & Search Produk */}
              <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk atau deskripsi..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        Kategori: {c}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs px-3 py-2 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700 font-mono shrink-0">
                    {filteredProducts.length} Produk
                  </span>
                </div>
              </div>

              {/* Tabel Produk */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-2xl">
                {productsLoading ? (
                  <div className="p-16 text-center text-slate-400">
                    <span className="inline-block w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3"></span>
                    <p className="text-sm">Memuat katalog produk dari database MongoDB...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 text-sm">
                    Tidak ada produk yang cocok dengan pencarian.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase font-mono border-b border-slate-800">
                        <tr>
                          <th className="px-5 py-3.5">Nama Produk</th>
                          <th className="px-5 py-3.5">Kategori</th>
                          <th className="px-5 py-3.5">Harga</th>
                          <th className="px-5 py-3.5">Stok</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredProducts.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-800/30 transition">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{p.name}</p>
                              {p.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-slate-800 text-teal-300 border border-slate-700">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-mono font-semibold text-emerald-400">
                              {formatRupiah(p.price)}
                            </td>
                            <td className="px-5 py-4 font-mono">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  p.stock <= 10
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {p.stock} unit
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  p.isActive ? 'text-emerald-400' : 'text-slate-500'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    p.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                                  }`}
                                ></span>
                                {p.isActive ? 'Tersedia' : 'Non-aktif'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs border border-slate-700 transition cursor-pointer"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 text-xs border border-rose-500/30 transition cursor-pointer"
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: MANAJEMEN PENGGUNA (CRUD)                         */}
          {/* ======================================================== */}
          {menu === 'pengguna' && currentUser.role !== 'admin' && (
            <div className="max-w-xl p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center mx-auto my-12 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                🔒
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak (Khusus Admin)</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Halaman Manajemen Pengguna hanya dapat diakses oleh akun dengan status <span className="text-amber-400 font-semibold">Administrator</span>. 
                Akun Anda saat ini memiliki role <span className="text-cyan-400 font-semibold uppercase">{currentUser.role || 'user'}</span>.
              </p>
              <a
                href="/dashboard/beranda"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                ← Kembali ke Beranda
              </a>
            </div>
          )}

          {menu === 'pengguna' && currentUser.role === 'admin' && (
            <div className="max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-white">{content.icon} {content.title}</h1>
                  <p className="text-slate-400 text-sm mt-1">{content.description}</p>
                </div>
                <button
                  onClick={handleOpenAddUser}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>➕</span> Tambah Pengguna
                </button>
              </div>

              {/* Bar Filter & Search Pengguna */}
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari nama, email, atau role..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 font-mono">
                  {filteredUsers.length} dari {usersList.length} User
                </span>
              </div>

              {/* Tabel Pengguna */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-2xl">
                {usersLoading ? (
                  <div className="p-16 text-center text-slate-400">
                    <span className="inline-block w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></span>
                    <p className="text-sm">Memuat data dari database MongoDB melalui Express middleware...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 text-sm">
                    Tidak ada data pengguna yang cocok.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase font-mono border-b border-slate-800">
                        <tr>
                          <th className="px-5 py-3.5">Nama</th>
                          <th className="px-5 py-3.5">Email</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Usia</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredUsers.map((u) => {
                          const isSelf = currentUser.id === u._id;
                          return (
                            <tr key={u._id} className="hover:bg-slate-800/30 transition">
                              <td className="px-5 py-4 font-semibold text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xs font-bold uppercase">
                                  {u.name ? u.name.charAt(0) : '?'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                                      Anda
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-slate-400 font-mono text-xs">{u.email}</td>
                              <td className="px-5 py-4">
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded font-mono uppercase font-semibold ${
                                    u.role === 'admin'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-400">{u.age || '-'} thn</td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                    u.isActive ? 'text-emerald-400' : 'text-slate-500'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      u.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                                    }`}
                                  ></span>
                                  {u.isActive ? 'Aktif' : 'Non-aktif'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs border border-slate-700 transition cursor-pointer"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={isSelf}
                                    title={isSelf ? 'Tidak bisa menghapus akun sendiri' : 'Hapus'}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer ${
                                      isSelf
                                        ? 'opacity-30 cursor-not-allowed text-slate-500 border-slate-800'
                                        : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border-rose-500/30'
                                    }`}
                                  >
                                    🗑️ Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: LAINNYA (Laporan, Pengaturan)                      */}
          {/* ======================================================== */}
          {menu !== 'beranda' && menu !== 'pengguna' && menu !== 'produk' && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-black text-white mb-3">
                {content.icon} {content.title}
              </h1>
              <p className="text-slate-400 leading-relaxed mb-8">{content.description}</p>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Data {content.title}</span>
                </div>
                <div className="p-12 text-center text-slate-500 text-sm">
                  Konten halaman <code className="text-cyan-400 font-mono">{menu}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL USER                                               */}
      {/* ======================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {isEditingUser ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-slate-500 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Contoh: Rendra"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Password {isEditingUser && <span className="text-slate-500 font-normal">(opsional jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  required={!isEditingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={isEditingUser ? 'Kosongkan jika tidak ingin ganti' : 'Minimal 6 karakter'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Usia</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={userForm.age}
                    onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Akun Aktif (Bisa login)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={userModalLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {userModalLoading ? 'Menyimpan...' : isEditingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PRODUK                                             */}
      {/* ======================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {isEditingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-500 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Mechanical Keyboard"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Produk</label>
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Deskripsi singkat spesifikasi produk..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Accessories"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stok Unit</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Produk Tersedia / Aktif</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={productModalLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {productModalLoading ? 'Menyimpan...' : isEditingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
