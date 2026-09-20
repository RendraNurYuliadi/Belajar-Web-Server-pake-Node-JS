import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.konfirmasi) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }

    setLoading(true);
    // Nantinya: kirim ke Express -> POST /api/auth/register
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-teal-500/20">
            🚀
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Buat Akun Baru</h1>
          <p className="text-slate-400 text-sm mt-1">Bergabung dan mulai perjalanan Anda</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Rendra Nur Yuliandi"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="kamu@contoh.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
              <input
                type="password"
                name="konfirmasi"
                value={form.konfirmasi}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/25 active:scale-[0.98] cursor-pointer mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Mendaftarkan...
                </span>
              ) : (
                'Daftar Sekarang →'
              )}
            </button>
          </form>
        </div>

        {/* Link ke Login */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
