import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

// Route-level code splitting: each page is its own chunk, so the landing/login
// payload stays tiny and dashboards load on demand.
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage').then((m) => ({ default: m.RoleSelectionPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-cream">
    <Loader className="h-8 w-8 animate-spin text-brand-600" />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Backward-compatible alias for the old admin entry point */}
            <Route path="/admin-login" element={<LoginPage />} />
            <Route path="/signup" element={<RoleSelectionPage />} />
            <Route path="/signup/:role" element={<RegisterPage />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor/dashboard" element={<Dashboard />} />
            <Route path="/reviewer/dashboard" element={<Dashboard />} />
            <Route path="/publisher/dashboard" element={<Dashboard />} />
            <Route path="/user/dashboard" element={<Dashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
