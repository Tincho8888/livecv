import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import EditorPage from "./pages/EditorPage";
import PublicCVPage from "./pages/PublicCVPage";

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a"
      }}>
        <div style={{ color: "#ffffff" }}>Cargando...</div>
      </div>
    );
  }

  return session ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/:username" element={<PublicCVPage />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;