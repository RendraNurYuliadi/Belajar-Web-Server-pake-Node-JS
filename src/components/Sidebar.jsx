import { NavLink, useNavigate } from 'react-router-dom';

// Daftar menu sidebar dengan hak akses
const menuItems = [
  { slug: 'beranda', label: 'Beranda', icon: '🏠', adminOnly: false },
  { slug: 'produk', label: 'Produk', icon: '📦', adminOnly: false },
  { slug: 'pengguna', label: 'Pengguna', icon: '👥', adminOnly: true }, // Hanya untuk admin
  { slug: 'laporan', label: 'Laporan', icon: '📊', adminOnly: true },   // Hanya untuk admin
  { slug: 'pengaturan', label: 'Pengaturan', icon: '⚙️', adminOnly: false },
];

export default function Sidebar() {
  const navigate = useNavigate();

  // Ambil data user yang sedang login dari localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { name: 'Pengguna', email: 'user@mail.com', role: 'user' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initial = (user.name || 'U').charAt(0).toUpperCase();
  const isAdmin = user.role === 'admin';

  // Filter menu: jika bukan admin, sembunyikan menu yang bertanda adminOnly
  const accessibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-60 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight">MyApp</p>
            <p className="text-[11px] text-slate-500">
              {isAdmin ? 'Panel Admin' : 'Portal Pengguna'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 py-2">
          {isAdmin ? 'Menu Admin' : 'Menu Utama'}
        </p>
        {accessibleMenuItems.map((item) => (
          <NavLink
            key={item.slug}
            to={`/dashboard/${item.slug}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Info User & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/40 border border-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-600/20 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <span>🚪</span> Keluar
        </button>
      </div>
    </aside>
  );
}
