import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Analoginya sama persis dengan routes/web.php di Laravel!
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route "/" langsung redirect ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Halaman Publik (belum login) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Halaman Private (dilindungi Middleware Auth Frontend) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:menu"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 - Halaman Tidak Ditemukan */}
        <Route path="*" element={
          <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
            <h1 className="text-6xl font-black text-slate-700">404</h1>
            <p className="text-slate-400">Halaman tidak ditemukan.</p>
            <a href="/login" className="text-cyan-400 hover:underline text-sm">Kembali ke Login</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
