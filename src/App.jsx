import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import PublicCVPage from "./pages/PublicCVPage";

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        background: "#0a0a0b",
        color: "#fff"
      }}>
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Página simple de login
function LoginPage() {
  const navigate = useNavigate();
  
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0b",
      color: "#fff"
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>LIVE<span style={{ fontSize: 16, opacity: 0.7 }}>CV</span></h1>
        <p style={{ opacity: 0.7, marginBottom: 32 }}>Crea tu CV profesional</p>
        <button
          onClick={handleGoogleLogin}
          style={{
            background: "#270979",
            color: "#fff",
            border: "none",
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/cv/:slug" element={<PublicCVPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}