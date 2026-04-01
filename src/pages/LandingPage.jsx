import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#ffffff",
      margin: 0,
      padding: 0
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: #0a0a0a;
          margin: 0;
          padding: 0;
          position: relative;
        }
        
        body::before {
          content: "";
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, #3d1fd1, transparent 70%);
          opacity: 0.25;
          filter: blur(120px);
          top: -250px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 64px",
        background: scrolled ? "rgba(10,10,10,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ 
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.9
        }}>
          <span style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: -0.5,
            color: "#ffffff"
          }}>LIVE</span>
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 2,
            color: "#ffffff",
            opacity: 0.6
          }}>CV</span>
        </div>
        <button 
          onClick={() => navigate("/login")}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            padding: "8px 0",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            opacity: 0.5,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.target.style.opacity = "1"}
          onMouseLeave={e => e.target.style.opacity = "0.5"}
        >
          Iniciar sesión
        </button>
      </nav>

      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 64px 40px",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <div style={{ animation: "fadeIn 1s ease-out" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(56px, 7vw, 96px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: -2,
            background: "linear-gradient(135deg, #ffffff 0%, #ffffff 15%, #60a5fa 45%, #a78bfa 70%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Tu perfil profesional, vivo.
          </h1>

          <p style={{
            fontSize: 18,
            color: "#999",
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: 700,
            margin: "0 auto 40px",
            fontWeight: 400
          }}>
            Creá tu cv profesional y mantenelo siempre en línea.<br/>
            Optimizalo con nuestro potente editor y revisá los cambios en tiempo real.
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 50,
            marginBottom: 40,
            flexWrap: "wrap"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              maxWidth: 170
            }}>
              <span style={{ fontSize: 26 }}>⚡</span>
              <div style={{
                fontSize: 16,
                color: "#d1d1d1",
                fontWeight: 600,
                textAlign: "center"
              }}>
                Crealo en minutos
              </div>
              <p style={{
                fontSize: 12,
                color: "#888",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.4
              }}>
                Subí tu PDF o arrancá de cero
              </p>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              maxWidth: 170
            }}>
              <span style={{ fontSize: 26 }}>✨</span>
              <div style={{
                fontSize: 16,
                color: "#d1d1d1",
                fontWeight: 600,
                textAlign: "center"
              }}>
                Optimizalo con IA
              </div>
              <p style={{
                fontSize: 12,
                color: "#888",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.4
              }}>
                Mejoramos tu CV automáticamente
              </p>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              maxWidth: 170
            }}>
              <span style={{ fontSize: 26 }}>🔗</span>
              <div style={{
                fontSize: 16,
                color: "#d1d1d1",
                fontWeight: 600,
                textAlign: "center"
              }}>
                Compartilo en un link
              </div>
              <p style={{
                fontSize: 12,
                color: "#888",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.4
              }}>
                URL única siempre actualizada
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate("/login")}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #ffffff 25%, #c4b5fd 60%, #a78bfa 100%)",
              color: "#0a0a0a",
              border: "none",
              padding: "14px 36px",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 0.2,
              boxShadow: "0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.1)"
            }}
          >
            Creá tu CV ahora gratis
          </button>
        </div>
      </section>
    </div>
  );
}