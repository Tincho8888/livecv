import { useState } from "react";
import { callClaude } from "../../services/aiService";

function buildPrompt(data, jobText) {
  const p = data.personal || {};
  const skills = (data.skills || []).map(s => s.name || s).join(", ");
  const experience = (data.experience || []).map(e =>
    `${e.role} en ${e.company} (${e.from}–${e.current ? "Presente" : e.to}): ${e.desc || "sin descripción"}`
  ).join("\n");

  return `Analizá este CV contra la oferta y devolvé SOLO un JSON válido, sin markdown ni texto extra.

CV:
Nombre: ${p.name || "?"} | Título: ${p.title || "?"}
Resumen: ${data.summary || "sin resumen"}
Skills: ${skills}
Experiencia:\n${experience}

OFERTA:
${jobText.slice(0, 3000)}

JSON exacto:
{
  "score": <0-100>,
  "scoreLabel": <"Bajo"|"Medio"|"Alto"|"Excelente">,
  "scoreSummary": <una oración>,
  "missingKeywords": [<máx 5 keywords que faltan>],
  "summaryTip": <qué cambiar en el resumen, máx 2 oraciones>,
  "skillsToAdd": [<máx 4 skills específicas>],
  "expTips": [{ "role": <cargo>, "tip": <qué destacar> }],
  "strongPoints": [<máx 3 puntos fuertes>]
}`;
}

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? "#4caf7d" : score >= 50 ? "#c8a96e" : score >= 30 ? "#e09a3a" : "#e05c5c";
  const r = 28, circ = 2 * Math.PI * r, fill = (score / 100) * circ;
  return (
    <div style={{ position:"relative", width:68, height:68, flexShrink:0 }}>
      <svg width="68" height="68" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 0.9s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:16, fontWeight:700, color, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:8, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>/100</span>
      </div>
    </div>
  );
};

const Chip = ({ text, bg, border, color }) => (
  <span style={{ fontSize:10, fontFamily:"var(--font-mono)", background:bg, border:`1px solid ${border}`, padding:"2px 8px", borderRadius:20, color, display:"inline-block" }}>
    {text}
  </span>
);

const Section = ({ label, children }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"var(--text-muted)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
    {children}
  </div>
);

export default function JobMatchPanel({ data }) {
  const [jobText, setJobText] = useState("");
  const [phase, setPhase]     = useState("input"); // input | loading | results
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  async function analyze() {
    if (!jobText.trim()) return;
    setPhase("loading"); setError(null);
    try {
      const raw = await callClaude(buildPrompt(data, jobText));
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no json");
      const json = JSON.parse(match[0]);
      setResult(json); setPhase("results");
    } catch {
      setError("No se pudo analizar. Intentá de nuevo.");
      setPhase("input");
    }
  }

  const scoreColor = result ? (result.score >= 75 ? "#4caf7d" : result.score >= 50 ? "#c8a96e" : result.score >= 30 ? "#e09a3a" : "#e05c5c") : "#c8a96e";

  return (
    <aside style={{ width:340, borderLeft:"1px solid var(--border)", background:"var(--bg)", display:"flex", flexDirection:"column", height:"calc(100vh - 52px)", position:"sticky", top:52, overflow:"hidden" }}>

      {/* Header */}
      <div style={{ padding:"18px 18px 12px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:600, color:"var(--text)", fontFamily:"var(--font-body)" }}>Ajustar a oferta</span>
        </div>
        <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.5 }}>
          Pegá la descripción del trabajo y te decimos exactamente qué cambiar.
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>

        {/* INPUT */}
        {(phase === "input" || phase === "loading") && <>
          <textarea
            style={{ width:"100%", minHeight:140, background:"var(--bg2)", border:`1px solid ${error ? "var(--red,#e05c5c)" : "var(--border)"}`, color:"var(--text)", fontFamily:"var(--font-body)", fontSize:12, padding:"10px 12px", borderRadius:"var(--radius-sm)", outline:"none", resize:"vertical", lineHeight:1.6, marginBottom:10, boxSizing:"border-box" }}
            placeholder="Pegá acá la descripción completa de la oferta..."
            value={jobText}
            disabled={phase === "loading"}
            onChange={e => { setJobText(e.target.value); setError(null); }}
          />
          {error && <div style={{ fontSize:11, color:"var(--red,#e05c5c)", fontFamily:"var(--font-mono)", marginBottom:10 }}>{error}</div>}
          <button
            className="btn btn-accent btn-sm"
            style={{ width:"100%", justifyContent:"center", opacity: phase === "loading" ? 0.6 : 1 }}
            disabled={!jobText.trim() || phase === "loading"}
            onClick={analyze}>
            {phase === "loading"
              ? <><span style={{ width:10, height:10, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite", display:"inline-block", marginRight:6 }}/>Analizando...</>
              : "Analizar compatibilidad →"}
          </button>
        </>}

        {/* RESULTS */}
        {phase === "results" && result && <>
          {/* Score */}
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px", background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border)", marginBottom:16 }}>
            <ScoreRing score={result.score} />
            <div>
              <div style={{ fontSize:9, fontFamily:"var(--font-mono)", color:"var(--text-muted)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:3 }}>Match</div>
              <div style={{ fontSize:18, fontWeight:700, color:scoreColor, fontFamily:"var(--font-display)", marginBottom:4, lineHeight:1 }}>{result.scoreLabel}</div>
              <div style={{ fontSize:11, color:"var(--text-soft,var(--text-muted))", lineHeight:1.5 }}>{result.scoreSummary}</div>
            </div>
          </div>

          {/* Strong points */}
          {result.strongPoints?.length > 0 && (
            <Section label="✓ Puntos fuertes">
              {result.strongPoints.map((p, i) => (
                <div key={i} style={{ display:"flex", gap:8, fontSize:12, color:"var(--text-soft,var(--text-muted))", lineHeight:1.5, marginBottom:5 }}>
                  <span style={{ color:"#4caf7d", flexShrink:0 }}>›</span><span>{p}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Keywords */}
          {result.missingKeywords?.length > 0 && (
            <Section label="Keywords que faltan">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {result.missingKeywords.map((kw, i) => (
                  <Chip key={i} text={kw} bg="rgba(224,92,92,0.08)" border="rgba(224,92,92,0.25)" color="#e05c5c"/>
                ))}
              </div>
            </Section>
          )}

          {/* Skills */}
          {result.skillsToAdd?.length > 0 && (
            <Section label="Skills a agregar">
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {result.skillsToAdd.map((s, i) => (
                  <Chip key={i} text={s} bg="rgba(200,169,110,0.08)" border="rgba(200,169,110,0.3)" color="var(--accent)"/>
                ))}
              </div>
            </Section>
          )}

          {/* Summary tip */}
          {result.summaryTip && (
            <Section label="Resumen profesional">
              <div style={{ padding:"10px 12px", background:"rgba(124,109,250,0.06)", border:"1px solid rgba(124,109,250,0.18)", borderRadius:9, fontSize:12, color:"var(--text-soft,var(--text-muted))", lineHeight:1.6 }}>
                {result.summaryTip}
              </div>
            </Section>
          )}

          {/* Exp tips */}
          {result.expTips?.length > 0 && (
            <Section label="Por experiencia">
              {result.expTips.map((et, i) => (
                <div key={i} style={{ padding:"10px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", marginBottom:6 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:"var(--accent)", fontFamily:"var(--font-mono)", marginBottom:4 }}>{et.role}</div>
                  <div style={{ fontSize:12, color:"var(--text-soft,var(--text-muted))", lineHeight:1.5 }}>{et.tip}</div>
                </div>
              ))}
            </Section>
          )}

          {/* Reset */}
          <button className="btn btn-ghost btn-sm" style={{ width:"100%", justifyContent:"center", marginTop:4 }}
            onClick={() => { setPhase("input"); setResult(null); }}>
            ← Analizar otra oferta
          </button>
        </>}
      </div>
    </aside>
  );
}