import { useState } from "react";
import { callClaude } from "../../services/aiService";

const MODES = [
  { id: "improve",  icon: "✦", title: "Mejorar",         desc: "Más impacto y claridad" },
  { id: "jobMatch", icon: "🎯", title: "Ajustar a oferta", desc: "Optimizar para un rol específico" },
  { id: "rewrite",  icon: "↺", title: "Reescribir",       desc: "Versión completamente nueva" },
  { id: "bullets",  icon: "◆", title: "Logros concretos", desc: "Bullets con métricas y resultados" },
];

export default function AiModal({ data, target, onClose, onApply }) {
  const [mode, setMode]       = useState(null);
  const [jobText, setJobText] = useState("");
  const [phase, setPhase]     = useState("options");
  const [results, setResults] = useState([]);
  const [picked, setPicked]   = useState(null);
  const [genStep, setGenStep] = useState("");

  function getLabel() {
    if (target === "summary") return "Resumen";
    if (target?.startsWith("exp-")) return "descripción de experiencia";
    if (target === "skills") return "Skills";
    return "sección";
  }

  function getContent() {
    if (target === "summary") return data.summary;
    if (target?.startsWith("exp-")) {
      const id = parseInt(target.replace("exp-", ""));
      return data.experience.find(e => e.id === id)?.desc || "";
    }
    if (target === "skills") return data.skills.map(s => s.name || s).join(", ");
    return "";
  }

  async function generate() {
    if (!mode) return;
    setPhase("generating");
    const content = getContent();
    const name  = data.personal.name;
    const title = data.personal.title;

    for (const s of ["Analizando tu perfil...", "Consultando con IA...", "Generando variantes..."]) {
      setGenStep(s);
      await new Promise(r => setTimeout(r, 500));
    }

    const prompts = {
      improve:  `Mejorá el siguiente ${getLabel()} de ${name||"esta persona"} (${title||"profesional"}). Devolvé SOLO 3 versiones mejoradas separadas por "---OPCION---". Sin explicaciones.\n\n${content}`,
      jobMatch: `Reescribí el ${getLabel()} para que encaje con esta oferta. Devolvé SOLO 3 versiones separadas por "---OPCION---".\n\nCV actual:\n${content}\n\nOferta:\n${jobText}`,
      rewrite:  `Reescribí completamente el ${getLabel()} de ${name||"esta persona"}. Devolvé SOLO 3 versiones distintas separadas por "---OPCION---".\n\n${content}`,
      bullets:  `Convertí en bullets de logros con métricas. Devolvé SOLO 3 versiones separadas por "---OPCION---".\n\n${content}`,
    };

    try {
      const text  = await callClaude(prompts[mode]);
      const parts = text.split("---OPCION---").map(s => s.trim()).filter(Boolean);
      setResults(parts.length > 0 ? parts : [text.trim()]);
      setPicked(0);
      setPhase("results");
    } catch {
      setResults(["Error al conectar con la IA."]);
      setPhase("results");
    }
  }

  function apply() {
    if (picked === null || !results[picked]) return;
    onApply(target, results[picked]);
    onClose();
  }

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>

        {phase === "options" && <>
          <div className="ai-modal-title">
            Mejorar con IA <span className="ai-modal-title-badge">✦ Claude</span>
          </div>
          <div className="ai-modal-sub">
            Mejorando: <strong style={{ color: "var(--accent)" }}>{getLabel()}</strong>
          </div>
          <div className="ai-option-grid">
            {MODES.map(m => (
              <div key={m.id} className={`ai-option ${mode===m.id?"selected":""}`} onClick={() => setMode(m.id)}>
                <div className="ai-option-icon">{m.icon}</div>
                <div className="ai-option-title">{m.title}</div>
                <div className="ai-option-desc">{m.desc}</div>
              </div>
            ))}
          </div>
          {mode === "jobMatch" && (
            <textarea
              style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", borderRadius: "var(--radius-sm)", outline: "none", minHeight: 100, marginBottom: 16, resize: "vertical" }}
              placeholder="Pegá la oferta de trabajo acá..."
              value={jobText}
              onChange={e => setJobText(e.target.value)}
            />
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-ai" style={{ flex: 2, justifyContent: "center", fontFamily: "var(--font-mono)" }}
              disabled={!mode || (mode==="jobMatch" && !jobText.trim())} onClick={generate}>
              ✦ Generar con IA
            </button>
          </div>
        </>}

        {phase === "generating" && (
          <div className="ai-generating">
            <div className="ai-spinner" />
            <div className="ai-generating-text">Claude está trabajando</div>
            <div className="ai-generating-sub">{genStep}</div>
          </div>
        )}

        {phase === "results" && <>
          <div className="ai-modal-title">
            Elegí una versión <span className="ai-modal-title-badge">{results.length} variantes</span>
          </div>
          <div className="ai-modal-sub">Seleccioná la que más te guste. Podés editarla después.</div>
          <div className="ai-results">
            {results.map((r, i) => (
              <div key={i} className={`ai-result-item ${picked===i?"picked":""}`} onClick={() => setPicked(i)}>
                <div className="ai-result-tag">Opción {i + 1}</div>
                <div className="ai-result-text">{r}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPhase("options")}>← Volver</button>
            <button className="btn btn-accent" style={{ flex: 2, justifyContent: "center" }}
              disabled={picked === null} onClick={apply}>
              Aplicar opción {picked !== null ? picked + 1 : ""} ✓
            </button>
          </div>
        </>}

      </div>
    </div>
  );
}
