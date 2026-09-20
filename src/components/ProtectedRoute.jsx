import { Navigate } from 'react-router-dom';

/**
 * Komponen Middleware Client-Side (Protected Route)
 * Mirip middleware auth di Laravel:
 * Jika belum login (tidak ada token di localStorage), redirect ke /login
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
