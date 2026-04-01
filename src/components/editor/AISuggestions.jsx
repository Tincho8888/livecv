import { useState, useEffect, useRef } from "react";
import { callClaude } from "../../services/aiService";



function profileSummary(data) {
  const p = data?.personal || {};
  const skills = (data?.skills || []).map(s => s.name || s).slice(0, 12).join(", ");
  const roles  = (data?.experience || []).slice(0, 3).map(e => e.role).filter(Boolean).join(", ");
  return `Nombre: ${p.name||"?"}. Título: ${p.title||"?"}. Experiencia: ${roles||"ninguna"}. Skills: ${skills||"ninguna"}. Resumen: ${data?.summary?.slice(0,200)||"vacío"}.`;
}

const TYPES = [
  { id:"gaps",    label:"Gaps del perfil",   icon:"◎", prompt: ctx => `Analizá este CV y listá los 4 gaps o datos faltantes más importantes para hacerlo más atractivo. Sé específico. Perfil: ${ctx}` },
  { id:"skills",  label:"Skills sugeridas",  icon:"⌥", prompt: ctx => `Basándote en el título y experiencia, sugerí 6 skills técnicas o blandas que debería agregar. Solo listá los nombres, uno por línea. Perfil: ${ctx}` },
  { id:"summary", label:"Mejora el resumen", icon:"✦", prompt: ctx => `Reescribí el resumen profesional en primera persona, máximo 3 oraciones, más impactante. Solo devolvé el texto. Perfil: ${ctx}` },
  { id:"ats",     label:"Tips ATS",          icon:"⟐", prompt: ctx => `Dá 4 recomendaciones concretas para mejorar el score ATS de este CV. Perfil: ${ctx}` },
];

async function fetchSuggestion(type, data) {
  return await callClaude(type.prompt(profileSummary(data)));
}

export default function AISuggestions({ data }) {
  const [active, setActive]   = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache]     = useState({});
  const prevSig               = useRef(null);

  useEffect(() => {
    const sig = profileSummary(data);
    if (prevSig.current && prevSig.current !== sig) { setCache({}); setResult(null); setActive(null); }
    prevSig.current = sig;
  }, [data]);

  async function handleSelect(type) {
    if (loading) return; // evitar doble click
    setActive(type.id);
    if (cache[type.id] !== undefined) { setResult(cache[type.id]); return; }
    setLoading(true); setResult(null);
    try {
      const text = await fetchSuggestion(type, data);
      const out = text?.trim() || "Sin respuesta del modelo.";
      setCache(c => ({ ...c, [type.id]: out }));
      setResult(out);
    } catch(err) {
      console.error("AISuggestions error:", err);
      setResult("Error al conectar. Intentá de nuevo.");
    }
    finally { setLoading(false); }
  }

  const hasProfile = !!(data?.personal?.name || data?.experience?.length || data?.skills?.length);

  return (
    <aside style={{ borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--bg2)", overflow:"hidden", height:"100%" }}>

      {/* header */}
      <div style={{ padding:"13px 14px 10px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
          {/* mismo ícono estrella que usa el sistema IA */}
          <span style={{ fontSize:13, color:"var(--accent)", lineHeight:1 }}>✦</span>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
            IA Sugerencias
          </span>
        </div>
        <p style={{ fontSize:10, color:"var(--text-muted)", lineHeight:1.5, margin:0, fontFamily:"var(--font-mono)" }}>
          {hasProfile ? "Basado en tu perfil actual" : "Completá tu perfil primero"}
        </p>
      </div>

      {/* buttons */}
      <div style={{ padding:"8px 8px 4px", flexShrink:0 }}>
        {TYPES.map(type => (
          <button key={type.id} onClick={() => hasProfile && handleSelect(type)}
            disabled={!hasProfile}
            style={{
              display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
              borderRadius:6, border:"none", width:"100%", textAlign:"left",
              background: active===type.id ? "var(--accent-glow)" : "transparent",
              cursor: hasProfile ? "pointer" : "not-allowed",
              outline: active===type.id ? "1px solid rgba(200,169,110,0.25)" : "none",
              opacity: hasProfile ? 1 : 0.4, transition:"background 0.12s", marginBottom:2,
            }}
            onMouseEnter={e => { if(active!==type.id) e.currentTarget.style.background="var(--bg3)"; }}
            onMouseLeave={e => { if(active!==type.id) e.currentTarget.style.background="transparent"; }}>
            <span style={{ fontSize:12, color:"var(--accent)", fontFamily:"var(--font-mono)", flexShrink:0, width:14, textAlign:"center" }}>{type.icon}</span>
            <span style={{ fontSize:11, fontWeight: active===type.id?600:400, color: active===type.id?"var(--accent)":"var(--text-soft)", fontFamily:"var(--font-body)", flex:1 }}>
              {type.label}
            </span>
            {active===type.id && loading && (
              <span style={{ width:8, height:8, borderRadius:"50%", border:"1.5px solid var(--accent)", borderTopColor:"transparent", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ height:1, background:"var(--border)", margin:"4px 0", flexShrink:0 }} />

      {/* result */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 16px" }}>
        {loading && !result && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:100, gap:10 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid var(--border)", borderTopColor:"var(--accent)", animation:"spin 0.7s linear infinite" }} />
            <span style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>Analizando...</span>
          </div>
        )}

        {!loading && result !== null && (
          <div style={{ fontSize:12, color:"var(--text-soft)", lineHeight:1.7, fontFamily:"var(--font-body)" }}>
            {result.split("\n").filter(l=>l.trim()).map((line,i) => {
              const isBullet = /^[-•*\d]/.test(line.trim());
              const text = line.replace(/^[-•*\d.]+\s*/,"").trim();
              return isBullet ? (
                <div key={i} style={{ display:"flex", gap:7, marginBottom:7 }}>
                  <span style={{ color:"var(--accent)", fontSize:12, flexShrink:0 }}>›</span>
                  <span>{text}</span>
                </div>
              ) : (
                <p key={i} style={{ margin:"0 0 7px" }}>{line}</p>
              );
            })}
            <button onClick={() => { setResult(null); setCache(c=>({...c,[active]:undefined})); handleSelect(TYPES.find(t=>t.id===active)); }}
              style={{ marginTop:8, fontSize:10, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:4 }}>
              ↻ regenerar
            </button>
          </div>
        )}

        {!loading && result === null && hasProfile && (
          <div style={{ textAlign:"center", padding:"20px 6px", color:"var(--text-muted)", fontSize:10, lineHeight:1.6, fontFamily:"var(--font-mono)" }}>
            Elegí una opción para obtener sugerencias personalizadas
          </div>
        )}
      </div>
    </aside>
  );
}