import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/editor");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/editor");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/editor`
      }
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/editor`
      }
    });

    if (error) {
      console.error("Error:", error);
      alert("Error al enviar el link. Intentá de nuevo.");
    } else {
      alert("¡Link enviado! Revisá tu email.");
    }
    setLoading(false);
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
        padding: 40,
        width: "100%"
      }}>
        {/* Logo */}
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

        {/* OAuth Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Google */}
          <button
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
            style={{
              background: "#ffffff",
              color: "#0a0a0a",
              border: "none",
              padding: "14px 24px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={e => !loading && (e.target.style.transform = "translateY(-2px)")}
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

          {/* GitHub */}
          <button
            onClick={() => handleOAuthLogin("github")}
            disabled={loading}
            style={{
              background: "#24292e",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "14px 24px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={e => !loading && (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continuar con GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "24px 0"
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 13, color: "#666" }}>o</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Email Magic Link */}
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            style={{
              background: "transparent",
              color: "#8b5cf6",
              border: "1px solid #8b5cf6",
              padding: "14px 24px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.target.style.background = "rgba(139,92,246,0.1)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "transparent";
            }}
          >
            Continuar con email
          </button>
        ) : (
          <form onSubmit={handleMagicLink} style={{ width: "100%" }}>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 15,
                marginBottom: 12,
                outline: "none",
                transition: "border 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#8b5cf6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                background: "#8b5cf6",
                color: "#ffffff",
                border: "none",
                padding: "14px 24px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || !email ? "not-allowed" : "pointer",
                width: "100%",
                transition: "all 0.2s",
                opacity: loading || !email ? 0.6 : 1
              }}
              onMouseEnter={e => !loading && email && (e.target.style.opacity = "0.9")}
              onMouseLeave={e => e.target.style.opacity = loading || !email ? "0.6" : "1"}
            >
              {loading ? "Enviando..." : "Enviar link mágico"}
            </button>
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              style={{
                background: "transparent",
                color: "#666",
                border: "none",
                padding: "8px",
                fontSize: 13,
                cursor: "pointer",
                marginTop: 12,
                width: "100%"
              }}
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}