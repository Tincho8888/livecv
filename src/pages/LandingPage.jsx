import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bentoCards = [
    {
      id: 1,
      icon: "📄",
      title: "Carga tu PDF",
      desc: "Arrastrá tu CV actual o créalo desde cero con nuestro editor.",
      color: "#8b5cf6",
      delay: 0
    },
    {
      id: 2,
      icon: "✨",
      title: "Optimizalo con IA",
      desc: "Mejoramos tu CV automáticamente para que destaque.",
      color: "#6366f1",
      delay: 0.1
    },
    {
      id: 3,
      icon: "🔗",
      title: "Compartilo en un link",
      desc: "URL única, siempre actualizada y lista para enviar.",
      color: "#a78bfa",
      delay: 0.2
    }
  ];

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#ffffff",
      margin: 0,
      padding: 0,
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: #0a0a0a;
          margin: 0;
          padding: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        .bento-card-1 {
          animation: float1 6s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bento-card-2 {
          animation: float2 5s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bento-card-3 {
          animation: float3 7s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bento-card-4 {
          animation: float4 5.5s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bento-card-1:hover,
        .bento-card-2:hover,
        .bento-card-3:hover,
        .bento-card-4:hover {
          transform: translateY(-6px) scale(1.02);
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 64px",
        background: scrolled ? "rgba(10,10,10,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
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
            fontSize: 13,
            fontWeight: 500,
            opacity: 0.6,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.target.style.opacity = "1"}
          onMouseLeave={e => e.target.style.opacity = "0.6"}
        >
          Iniciar sesión
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "110px 64px 80px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 100
      }}>
        {/* Left: Copy */}
        <div style={{ 
          maxWidth: 550,
          animation: "fadeIn 0.8s ease-out",
          flex: "0 0 auto"
        }}>
          <h1 style={{
            fontSize: "clamp(44px, 5.5vw, 72px)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: -1.5,
            color: "#ffffff"
          }}>
            TU PRÓXIMA ENTREVISTA<br/>
            COMIENZA ACA.
          </h1>

          <h2 style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            fontWeight: 400,
            lineHeight: 1.3,
            marginBottom: 48,
            color: "#999",
            letterSpacing: -0.3
          }}>
            Tu CV profesional siempre en línea.
          </h2>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 20
          }}>
            <button 
              onClick={() => navigate("/login")}
              style={{
                background: "#ffffff",
                color: "#0a0a0a",
                border: "none",
                padding: "18px 40px",
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: "all 0.2s",
                boxShadow: "0 0 0 0 rgba(255,255,255,0.5)"
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 32px rgba(255,255,255,0.2)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 0 0 0 rgba(255,255,255,0.5)";
              }}
            >
              SUBI O CREA TU CV <span style={{ fontWeight: 900 }}>GRATIS</span>
            </button>

            {/* Login link - horizontal */}
            <div style={{
              fontSize: 14,
              color: "#666"
            }}>
              ya tengo mi cv.{" "}
              <span 
                onClick={() => navigate("/login")}
                style={{
                  color: "#666",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={e => e.target.style.opacity = "0.7"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Iniciar sesión →
              </span>
            </div>
          </div>
        </div>

        {/* Right: Bento Grid */}
        <div style={{
          flex: "1",
          maxWidth: 550,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          animation: "fadeIn 1s ease-out 0.3s backwards"
        }}>
          {bentoCards.map((card, index) => (
            <div
              key={card.id}
              className={`bento-card-${card.id}`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: hoveredCard === card.id 
                  ? `linear-gradient(135deg, rgba(${parseInt(card.color.slice(1,3), 16)}, ${parseInt(card.color.slice(3,5), 16)}, ${parseInt(card.color.slice(5,7), 16)}, 0.15) 0%, rgba(${parseInt(card.color.slice(1,3), 16)}, ${parseInt(card.color.slice(3,5), 16)}, ${parseInt(card.color.slice(5,7), 16)}, 0.05) 100%)`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${hoveredCard === card.id ? `${card.color}60` : "rgba(255,255,255,0.08)"}`,
                borderRadius: 16,
                padding: 32,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                gridColumn: index === 0 ? "span 2" : "span 1",
                backdropFilter: hoveredCard === card.id ? "blur(20px)" : "blur(0px)"
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: 48,
                marginBottom: 20,
                transform: hoveredCard === card.id ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "inline-block"
              }}>
                {card.icon}
              </div>

              {/* Title */}
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: hoveredCard === card.id ? card.color : "#fff",
                marginBottom: 10,
                transition: "color 0.3s ease"
              }}>
                {card.title}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 14,
                color: hoveredCard === card.id ? "#d1d1d1" : "#888",
                lineHeight: 1.6,
                transition: "color 0.3s ease"
              }}>
                {card.desc}
              </div>

              {/* Animated gradient glow on hover */}
              <div style={{
                position: "absolute",
                top: -150,
                right: -150,
                width: 300,
                height: 300,
                background: `radial-gradient(circle, ${card.color}60, transparent 70%)`,
                filter: "blur(50px)",
                opacity: hoveredCard === card.id ? 1 : 0,
                transition: "opacity 0.6s ease",
                pointerEvents: "none",
                zIndex: 0
              }} />

              {/* Subtle border glow */}
              {hoveredCard === card.id && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${card.color}40, transparent)`,
                  opacity: 0.1,
                  pointerEvents: "none"
                }} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}