export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#ffffff",
      padding: "20px"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: 600
      }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.9,
          marginBottom: 48,
          alignItems: "center"
        }}>
          <span style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: -2,
            color: "#ffffff"
          }}>LIVE</span>
          <span style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: 6,
            color: "#ffffff",
            opacity: 0.6
          }}>CV</span>
        </div>

        {/* Coming Soon */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 600,
          marginBottom: 16,
          color: "#ffffff"
        }}>
          Volvemos pronto
        </h1>

        <p style={{
          fontSize: 16,
          color: "#999",
          lineHeight: 1.6,
          marginBottom: 40
        }}>
          Estamos mejorando la experiencia.<br/>
          Volvemos en unos minutos.
        </p>

        {/* Animated dots */}
        <div style={{
          display: "flex",
          gap: 8,
          justifyContent: "center"
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#8b5cf6",
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
}