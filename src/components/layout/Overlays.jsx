export function DropZone({ visible }) {
  if (!visible) return null;
  return (
    <div className="drop-overlay">
      <div className="drop-box">
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <h2>Soltá tu CV aquí</h2>
        <p style={{ marginTop: 8 }}>Importamos tu PDF automáticamente</p>
      </div>
    </div>
  );
}

export function ImportingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className="drop-overlay">
      <div className="drop-box" style={{ border: "2px solid var(--accent2)" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(124,109,250,0.3)", borderTopColor: "var(--accent2)",
          animation: "spin 0.7s linear infinite", margin: "0 auto 20px"
        }} />
        <h2 style={{ color: "var(--accent2)" }}>Generando tu CV</h2>
        <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
          La IA está extrayendo y organizando todos tus datos...
        </p>
        <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          Esto puede tardar unos segundos
        </p>
      </div>
    </div>
  );
}
