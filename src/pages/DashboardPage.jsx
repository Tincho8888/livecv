import { useRef } from "react";

export default function DashboardPage({ session, cvList, cvsLoading, onOpen, onNew, onDelete, onImportFile }) {
  const fileRef = useRef();
  const firstName = session?.user?.user_metadata?.full_name?.split(" ")[0] || null;

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "var(--text-soft)", marginBottom: 6 }}>
            {firstName ? `Hola, ${firstName} 👋` : "Bienvenido 👋"}
          </div>
          <div className="dashboard-title">Mis CVs</div>
        </div>
      </div>

      {cvsLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.75s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>Cargando tus CVs...</div>
        </div>
      ) : (
        <div className="cv-grid">

          {/* New CV card */}
          <div className="cv-card cv-card-new" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, padding: "24px 16px", cursor: "default" }}>
            <button onClick={onNew}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 12px", borderRadius: 10, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <div style={{ fontSize: 26, color: "var(--text-muted)" }}>+</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Crear desde cero</div>
            </button>

            <div style={{ width: "80%", height: 1, background: "var(--border)", margin: "4px 0" }} />

            <button onClick={() => fileRef.current.click()}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 12px", borderRadius: 10, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <div style={{ color: "var(--text-soft)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <polyline points="12 18 12 12"/><polyline points="9 15 12 12 15 15"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)" }}>Importar PDF o Word</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.4 }}>La IA completa los datos solos</div>
            </button>

            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) onImportFile(f); e.target.value = ""; }} />
          </div>

          {/* CV cards */}
          {cvList.map(cv => (
            <div className="cv-card" key={cv.id}
              onClick={() => onOpen(cv)}
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

              {/* Top row: icon + public badge */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                {cv.is_public
                  ? <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--green)", border: "1px solid rgba(76,175,125,0.3)", padding: "2px 8px", borderRadius: 10, background: "rgba(76,175,125,0.08)" }}>● público</span>
                  : <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text-muted)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 10, background: "var(--bg3)" }}>○ privado</span>
                }
              </div>

              {/* Title & meta */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6, fontFamily: "var(--font-body)" }}>{cv.title}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 3 }}>
                  {cv.data?.personal?.name || "Sin nombre"}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", gap: 10 }}>
                  <span>{cv.data?.experience?.length || 0} exp</span>
                  <span>·</span>
                  <span>Editado {new Date(cv.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, marginTop: 16 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onOpen(cv)}>
                  Editar
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", borderColor: "transparent" }}
                  onClick={e => onDelete(e, cv.id)} title="Eliminar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}