import { SECTIONS } from "../../lib/cvDefaults";
import { updateCVMeta } from "../../services/cvService";

// ─── TOGGLE ───────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, flexShrink: 0,
        background: checked ? "var(--accent)" : "var(--bg3)",
        border: `1px solid ${checked ? "var(--accent)" : "var(--border-active)"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", transition: "all 0.2s", opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? 17 : 2,
        width: 14, height: 14, borderRadius: "50%",
        background: checked ? "#0a0a0b" : "var(--text-muted)",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

export default function EditorSidebar({
  active, onSelect, data, pct, cvTitle, onCvTitleChange,
  onExport, onShare, onGoToDashboard,
  currentCvId, isPublic, defaultTheme, onTogglePublic, onToggleTheme,
}) {

  async function handleTogglePublic(val) {
    onTogglePublic(val);
    if (currentCvId) {
      try { await updateCVMeta(currentCvId, { is_public: val }); } catch {}
    }
  }

  async function handleToggleTheme(val) {
    const theme = val ? "light" : "dark";
    onToggleTheme(theme);
    if (currentCvId) {
      try { await updateCVMeta(currentCvId, { default_theme: theme }); } catch {}
    }
  }

  return (
    <aside className="sidebar">
      {/* Progreso */}
      <div className="progress-bar-wrap">
        <div className="progress-label">
          <span>Completitud</span>
          <span style={{ color: pct > 70 ? "var(--green)" : "var(--accent)" }}>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pct + "%" }} />
        </div>
      </div>

      {/* Nombre del CV */}
      <div style={{ padding: "0 16px 12px" }}>
        <input
          value={cvTitle}
          onChange={e => onCvTitleChange(e.target.value)}
          style={{ fontSize: 12, padding: "6px 10px", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, width: "100%", fontFamily: "var(--font-mono)" }}
          placeholder="Nombre del CV"
        />
      </div>

      <div className="sidebar-divider" />
      <div className="sidebar-label">Secciones</div>

      {SECTIONS.map(s => {
        const cnt = Array.isArray(data[s.id]) ? data[s.id].length : null;
        return (
          <div key={s.id} className={`section-item ${active === s.id ? "active" : ""}`} onClick={() => onSelect(s.id)}>
            <span className="icon">{s.icon}</span>
            <span>{s.label}</span>
            {cnt !== null && cnt > 0 && <span className="count">{cnt}</span>}
          </div>
        );
      })}

      <div className="sidebar-divider" />
      <div className="sidebar-label">Configuración</div>

      {/* Toggle: Tema por defecto */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
            {defaultTheme === "light" ? "☀ Modo claro" : "☾ Modo oscuro"}
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 1 }}>
            Tema por defecto del CV
          </div>
        </div>
        <Toggle checked={defaultTheme === "light"} onChange={handleToggleTheme} disabled={!currentCvId} />
      </div>

      <div className="section-item" onClick={onGoToDashboard}><span className="icon">◈</span><span>Mis CVs</span></div>

    </aside>
  );
}