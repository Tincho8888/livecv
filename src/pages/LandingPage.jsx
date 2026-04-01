import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/editor");
      }
    });

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/editor");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/editor`
      }
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0a",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: 400,
        padding: 40
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.9,
          marginBottom: 40,
          alignItems: "center"
        }}>
          <span style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: -1,
            color: "#ffffff"
          }}>LIVE</span>
          <span style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 4,
            color: "#ffffff",
            opacity: 0.6
          }}>CV</span>
        </div>

        <h2 style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#ffffff",
          marginBottom: 12
        }}>
          Crea tu CV profesional
        </h2>

        <p style={{
          fontSize: 16,
          color: "#999",
          marginBottom: 32
        }}>
          Iniciá sesión para continuar
        </p>

        <button
          onClick={handleGoogleLogin}
          style={{
            background: "#ffffff",
            color: "#0a0a0a",
            border: "none",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}