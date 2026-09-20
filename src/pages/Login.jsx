import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate(); // Mirip redirect() di Laravel
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const detail = data.error ? `: ${data.error}` : '';
                throw new Error(`${data.message || 'Login gagal'}${detail}`);
            }

            // Simpan token JWT dan profil user ke localStorage (seperti auth session)
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Berhasil login -> redirect ke dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Gagal terhubung ke backend Express!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-cyan-500/20">
                        ⚡
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Selamat Datang Kembali</h1>
                    <p className="text-slate-400 text-sm mt-1">Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="admin@mail.com"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white placeholder-slate-500 outline-none transition"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98] cursor-pointer mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Memeriksa...
                                </span>
                            ) : (
                                'Masuk →'
                            )}
                        </button>
                    </form>

                    {/* Hint akun dari MongoDB */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 text-center">
                        Akun MongoDB: <code className="text-cyan-300">rendra@gmail.com</code> / <code className="text-cyan-300">123456</code>
                    </div>
                </div>

                {/* Link ke Register */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
                        Daftar Sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
