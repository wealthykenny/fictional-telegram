import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(id);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between rounded-xl border border-gold/40 bg-slate-900/60 p-4">
        <h1 className="font-cinzel text-2xl text-gold">The Knight of Order</h1>
        <nav className="space-x-4 text-sm">
          <Link className="hover:text-gold" to="/login">Login</Link>
          <Link className="hover:text-gold" to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/certificate/:serial" element={<CertificateVerifyPage />} />
      </Routes>
    </div>
  );
}
