import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Programs = lazy(() => import("./pages/Programs"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));

function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <main className="relative flex-1 flex flex-col overflow-hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden absolute top-3 left-3 z-30 w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        {children}
      </main>
    </div>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RootRedirect() {
  const { session, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><AppLayout><Clients /></AppLayout></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><AppLayout><ClientProfile /></AppLayout></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute><AppLayout><Programs /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><AppLayout><Pricing /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
