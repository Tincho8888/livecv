import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { callClaude } from "../../services/aiService";

// ─── SHARED UI ────────────────────────────────────────────

const EmptyState = ({ icon, text, onClick, btnText }) => (
  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 14, marginBottom: 12 }}>{text}</div>
    <button className="btn btn-ghost btn-sm" onClick={onClick}>{btnText}</button>
  </div>
);

// ─── SUMMARY SECTION ──────────────────────────────────────
const SUMMARY_MAX = 300;

function SummarySection({ data, onUpdate }) {
  const [improving, setImproving] = useState(false);
  const [improved, setImproved]   = useState(null);
  const charCount = (data.summary || "").length;
  const isOverLimit = charCount > SUMMARY_MAX;

  async function improveSummary() {
    setImproving(true);
    setImproved(null);
    try {
      const p = data.personal || {};
      const skills = (data.skills || []).filter(s => (s.level||3) >= 4).map(s => s.name || s).slice(0, 6).join(", ");
      const exp = (data.experience || []).slice(0, 2).map(e => `${e.role} en ${e.company}`).join(", ");
      const current = data.summary?.trim();
      const prompt = `Escribí un resumen profesional de CV. Máximo ${SUMMARY_MAX} caracteres. Primera persona. Impactante, directo, orientado a resultados. Solo el texto, sin comillas ni explicaciones.

Persona: ${p.name || ""} — ${p.title || ""}
Experiencia reciente: ${exp || "no especificada"}
Skills clave: ${skills || "no especificados"}
${current ? `Resumen actual (mejorarlo): ${current}` : ""}`;
      const result = await callClaude(prompt, false);
      setImproved(result.trim().slice(0, SUMMARY_MAX));
    } catch {
    } finally {
      setImproving(false);
    }
  }

  function applyImproved() {
    onUpdate(p => ({ ...p, summary: improved }));
    setImproved(null);
  }

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Resumen</div>
          <div className="section-subtitle">Presentación breve — máx {SUMMARY_MAX} caracteres</div>
        </div>
        <button className="btn btn-ai btn-sm" onClick={improveSummary} disabled={improving}>
          {improving
            ? <><span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(124,109,250,0.3)", borderTopColor: "var(--accent2)", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Generando...</>
            : <>✦ {data.summary?.trim() ? "Mejorar" : "Generar"} con IA</>
          }
        </button>
      </div>

      <div className="form-group">
        <div style={{ position: "relative" }}>
          <textarea
            rows={5}
            placeholder="Head de Operaciones con 10 años de experiencia en infraestructura y automatización..."
            value={data.summary}
            maxLength={SUMMARY_MAX + 50}
            onChange={e => onUpdate(p => ({ ...p, summary: e.target.value.slice(0, SUMMARY_MAX) }))}
          />
          <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: isOverLimit ? "var(--red)" : "var(--text-muted)" }}>
            {charCount}/{SUMMARY_MAX}
          </div>
        </div>
      </div>

      {improved && (
        <div style={{ background: "linear-gradient(135deg, rgba(124,109,250,0.07), rgba(200,169,110,0.04))", border: "1px solid rgba(124,109,250,0.25)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent2)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>✦ Sugerencia IA</div>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, marginBottom: 8 }}>{improved}</p>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 12 }}>{improved.length}/{SUMMARY_MAX} caracteres</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-accent btn-sm" onClick={applyImproved}>Usar este ↑</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setImproved(null)}>Descartar</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── EDITOR FORM ─────────────────────────────────────────
export default function EditorForm({ active, data, session, onUpdate }) {
  // Helpers
  function upP(k, v) { onUpdate(p => ({ ...p, personal: { ...p.personal, [k]: v } })); }
  function addE(sec) {
    const tmpl = {
      experience: { id: Date.now(), role: "", company: "", from: "", to: "", current: false, desc: "" },
      education:  { id: Date.now(), degree: "", school: "", from: "", to: "" },
      projects:   { id: Date.now(), name: "", url: "", desc: "" },
      certs:      { id: Date.now(), name: "", issuer: "", date: "", url: "" },
    };
    onUpdate(p => ({ ...p, [sec]: [...(p[sec] || []), tmpl[sec]] }));
  }
  function upE(sec, id, k, v) { onUpdate(p => ({ ...p, [sec]: p[sec].map(e => e.id === id ? { ...e, [k]: v } : e) })); }
  function rmE(sec, id)       { onUpdate(p => ({ ...p, [sec]: p[sec].filter(e => e.id !== id) })); }

  const [tagIn, setTagIn]   = [data._tagIn || "", v => onUpdate(p => ({ ...p, _tagIn: v }))];
  const [langIn, setLangIn] = [data._langIn || "", v => onUpdate(p => ({ ...p, _langIn: v }))];

  function addTag(k, inp, clearFn) {
    const v = inp.trim(); if (!v) return;
    if (k === "skills") { onUpdate(p => ({ ...p, skills: [...p.skills, { name: v, level: 3 }] })); }
    else { onUpdate(p => ({ ...p, [k]: [...p[k], v] })); }
    clearFn("");
  }
  function rmTag(k, v) {
    if (k === "skills") { onUpdate(p => ({ ...p, skills: p.skills.filter(t => (t.name||t) !== v) })); }
    else { onUpdate(p => ({ ...p, [k]: p[k].filter(t => t !== v) })); }
  }
  function setSkillLevel(name, level) {
    onUpdate(p => ({ ...p, skills: p.skills.map(s => (s.name||s) === name ? { name: s.name||s, level } : s) }));
  }

  // ── PERSONAL ──
  if (active === "personal") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Información Personal</div><div className="section-subtitle">La base de tu CV</div></div>
      </div>

      <div className="form-group" style={{ marginBottom: 20 }}>
        <label>Foto de perfil</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg3)", border: "1px solid var(--border-active)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {data.personal.avatar
              ? <img src={data.personal.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 24, color: "var(--text-muted)" }}>👤</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="avatar-input" style={{ cursor: "pointer" }}>
              <div className="btn btn-ghost btn-sm" style={{ display: "inline-flex", pointerEvents: "none" }}>
                {data.personal.avatar ? "Cambiar foto" : "Subir foto"}
              </div>
            </label>
            <input id="avatar-input" type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
              const file = e.target.files[0];
              if (!file || !session) return;
              const ext  = file.name.split(".").pop();
              const path = `${session.user.id}/avatar.${ext}`;
              await supabase.storage.from("avatars").remove([path]);
              const { error } = await supabase.storage.from("avatars").upload(path, file);
              if (!error) {
                const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                upP("avatar", urlData.publicUrl + "?t=" + Date.now());
              }
            }} />
            {data.personal.avatar && (
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8, color: "var(--red)" }} onClick={() => upP("avatar", "")}>Quitar</button>
            )}
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontFamily: "var(--font-mono)" }}>JPG, PNG — máx 2MB</div>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 20 }}>
        <label>Disponible para</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {["Remote", "Híbrido", "Presencial"].map(opt => {
            const selected = (data.personal.open_to || [])[0] === opt;
            return (
              <button key={opt} onClick={() => upP("open_to", selected ? [] : [opt])}
                style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", border: selected ? "1px solid var(--accent)" : "1px solid var(--border)", background: selected ? "var(--accent-bg)" : "var(--bg2)", color: selected ? "var(--accent)" : "var(--text-muted)", transition: "all 0.15s" }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group"><label>Nombre completo</label><input placeholder="Juan García" value={data.personal.name} onChange={e => upP("name", e.target.value)} /></div>
        <div className="form-group"><label>Título profesional</label><input placeholder="Senior Product Designer" value={data.personal.title} onChange={e => upP("title", e.target.value)} /></div>
      </div>
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label>Especialidades <span style={{ fontWeight: 400, opacity: 0.6 }}>— aparece debajo del título separado por |</span></label>
        <input placeholder="Observabilidad  |  IA Automatización  |  Bases de Datos" value={data.personal.subtitle || ""} onChange={e => upP("subtitle", e.target.value)} />
      </div>
      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group"><label>Email</label><input placeholder="juan@email.com" type="email" value={data.personal.email} onChange={e => upP("email", e.target.value)} /></div>
        <div className="form-group"><label>Teléfono</label><input placeholder="+54 11 0000-0000" value={data.personal.phone} onChange={e => upP("phone", e.target.value)} /></div>
      </div>
      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group"><label>Ubicación</label><input placeholder="Buenos Aires, Argentina" value={data.personal.location} onChange={e => upP("location", e.target.value)} /></div>
        <div className="form-group"><label>Sitio web</label><input placeholder="juangarcia.com" value={data.personal.website} onChange={e => upP("website", e.target.value)} /></div>
      </div>
      <div className="form-row" style={{ marginBottom: 16 }}>
        <div className="form-group"><label>LinkedIn</label><input placeholder="linkedin.com/in/juangarcia" value={data.personal.linkedin} onChange={e => upP("linkedin", e.target.value)} /></div>
        <div className="form-group"><label>GitHub</label><input placeholder="github.com/tuusuario" value={data.personal.github || ""} onChange={e => upP("github", e.target.value)} /></div>
      </div>
    </>
  );

  // ── SUMMARY ──
  if (active === "summary") return <SummarySection data={data} onUpdate={onUpdate} />;

  // ── EXPERIENCE ──
  if (active === "experience") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Experiencia</div><div className="section-subtitle">{data.experience.length} entradas</div></div>
        <button className="btn btn-accent btn-sm" onClick={() => addE("experience")}>+ Agregar</button>
      </div>
      {data.experience.length === 0 && <EmptyState icon="◆" text="Sin experiencia todavía" onClick={() => addE("experience")} btnText="Agregar primera entrada" />}
      {data.experience.map(exp => (
        <div className="card" key={exp.id}>
          <div className="card-header">
            <div><div className="card-title">{exp.role || "Nuevo rol"}</div><div className="card-subtitle">{exp.company || "Empresa"}</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="icon-btn danger" onClick={() => rmE("experience", exp.id)}>✕</button>
            </div>
          </div>

          {/* Tipo de experiencia */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { id: "empleo", label: "Empleo" },
              { id: "freelance", label: "Freelance" },
              { id: "consultoria", label: "Consultoría" },
              { id: "voluntariado", label: "Voluntariado" },
            ].map(opt => {
              const sel = (exp.type || "empleo") === opt.id;
              return (
                <button key={opt.id} onClick={() => upE("experience", exp.id, "type", opt.id)}
                  style={{ padding: "3px 12px", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: sel ? "1px solid rgba(200,169,110,0.5)" : "1px solid var(--border)", background: sel ? "rgba(200,169,110,0.12)" : "var(--bg2)", color: sel ? "var(--accent)" : "var(--text-muted)" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Cargo</label><input placeholder="Product Designer" value={exp.role} onChange={e => upE("experience", exp.id, "role", e.target.value)} /></div>
            <div className="form-group"><label>Empresa / Cliente</label><input placeholder="Mercado Libre" value={exp.company} onChange={e => upE("experience", exp.id, "company", e.target.value)} /></div>
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Desde</label><input placeholder="Ene 2022" value={exp.from} onChange={e => upE("experience", exp.id, "from", e.target.value)} /></div>
            <div className="form-group"><label>Hasta</label><input placeholder="Presente" disabled={exp.current} value={exp.current ? "Presente" : exp.to} onChange={e => upE("experience", exp.id, "to", e.target.value)} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={!!exp.current}
                onChange={e => {
                  const checked = e.target.checked;
                  // Si se tilda, destildar todos los demás primero
                  onUpdate(p => ({
                    ...p,
                    experience: p.experience.map(ex =>
                      ex.id === exp.id
                        ? { ...ex, current: checked }
                        : checked ? { ...ex, current: false } : ex
                    )
                  }));
                }}
                style={{ width: "auto" }} />
              Trabajo actual
              {data.experience.some(e => e.current && e.id !== exp.id) && exp.current === false && (
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>(ya hay uno activo)</span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span>Descripción</span>
              <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--text-muted)", fontWeight:400 }}>una línea = un bullet en la vista pública</span>
            </label>
            <textarea
              rows={4}
              placeholder={"Lideré rediseño del checkout → +23% conversión\nArmé equipo de 5 personas desde cero\nMigré infraestructura a AWS reduciendo costos 40%"}
              value={exp.desc}
              onChange={e => upE("experience", exp.id, "desc", e.target.value)}
            />
          </div>
        </div>
      ))}
    </>
  );

  // ── EDUCATION ──
  if (active === "education") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Educación</div><div className="section-subtitle">{data.education.length} entradas</div></div>
        <button className="btn btn-accent btn-sm" onClick={() => addE("education")}>+ Agregar</button>
      </div>
      {data.education.length === 0 && <EmptyState icon="◇" text="Sin educación cargada" onClick={() => addE("education")} btnText="Agregar" />}
      {data.education.map(edu => (
        <div className="card" key={edu.id}>
          <div className="card-header">
            <div><div className="card-title">{edu.degree || "Título"}</div><div className="card-subtitle">{edu.school || "Institución"}</div></div>
            <button className="icon-btn danger" onClick={() => rmE("education", edu.id)}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[{ id: "degree", label: "🎓 Grado" }, { id: "postgrad", label: "📖 Posgrado" }, { id: "course", label: "📋 Curso / Diplomatura" }].map(opt => {
              const sel = (edu.type || "course") === opt.id;
              return (
                <button key={opt.id} onClick={() => upE("education", edu.id, "type", opt.id)}
                  style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", border: sel ? "1px solid var(--accent)" : "1px solid var(--border)", background: sel ? "var(--accent-bg)" : "var(--bg2)", color: sel ? "var(--accent)" : "var(--text-muted)", transition: "all 0.15s" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Título</label><input placeholder="Lic. en Diseño Gráfico" value={edu.degree} onChange={e => upE("education", edu.id, "degree", e.target.value)} /></div>
            <div className="form-group"><label>Institución</label><input placeholder="UBA" value={edu.school} onChange={e => upE("education", edu.id, "school", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Desde</label><input placeholder="2018" value={edu.from} onChange={e => upE("education", edu.id, "from", e.target.value)} /></div>
            <div className="form-group"><label>Hasta (vacío si en curso)</label><input placeholder="2022" value={edu.to} onChange={e => upE("education", edu.id, "to", e.target.value)} disabled={edu.current} /></div>
          </div>
          {(edu.type === "degree" || edu.type === "postgrad") && (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              {[{ val: true, label: "✓ En curso" }, { val: false, label: "Graduado" }].map(opt => (
                <button key={String(opt.val)} onClick={() => upE("education", edu.id, "current", opt.val)}
                  style={{ padding: "4px 14px", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: edu.current === opt.val ? "1px solid rgba(76,175,125,0.5)" : "1px solid var(--border)", background: edu.current === opt.val ? "rgba(76,175,125,0.12)" : "var(--bg2)", color: edu.current === opt.val ? "#4caf7d" : "var(--text-muted)" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );

  // ── SKILLS ──
  if (active === "skills") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Skills</div><div className="section-subtitle">{data.skills.length} habilidades</div></div>
      </div>
      <div className="form-group">
        <label>Agregar skill (Enter)</label>
        <div className="tag-input-row">
          <input placeholder="Python, React, Docker..." value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("skills", tagIn, setTagIn)} />
          <button className="btn btn-accent btn-sm" onClick={() => addTag("skills", tagIn, setTagIn)}>+</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.skills.map(s => {
          const name = s.name || s;
          const level = s.level || 3;
          const category = s.category || "tool";
          return (
            <div key={name} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <input value={name} onChange={e => onUpdate(p => ({ ...p, skills: p.skills.map(sk => (sk.name||sk) === name ? { ...sk, name: e.target.value } : sk) }))}
                  style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-mono)", background: "transparent", border: "none", outline: "none", flex: 1, padding: 0 }} />
                <span className="tag-remove" onClick={() => rmTag("skills", name)} style={{ marginLeft: 8 }}>✕</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {[{ id: "language", label: "Lenguaje" }, { id: "framework", label: "Framework" }, { id: "tool", label: "Herramienta" }].map(cat => (
                  <button key={cat.id} onClick={() => onUpdate(p => ({ ...p, skills: p.skills.map(sk => (sk.name||sk) === name ? { ...sk, category: cat.id } : sk) }))}
                    style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", border: category === cat.id ? "1px solid var(--accent)" : "1px solid var(--border)", background: category === cat.id ? "var(--accent-bg)" : "transparent", color: category === cat.id ? "var(--accent)" : "var(--text-muted)", transition: "all 0.15s" }}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <input type="range" min="1" max="5" value={level} onChange={e => setSkillLevel(name, parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer", height: 4 }} />
            </div>
          );
        })}
      </div>
    </>
  );

  // ── PORTFOLIO ──
  if (active === "portfolio") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Portfolio</div><div className="section-subtitle">Links a tu trabajo — Behance, Dribbble, GitHub, sitio propio</div></div>
        <button className="btn btn-accent btn-sm" onClick={() => onUpdate(p => ({ ...p, portfolio: [...(p.portfolio||[]), { id: Date.now(), label: "", url: "" }] }))}>+ Agregar</button>
      </div>
      {(!data.portfolio || data.portfolio.length === 0) && (
        <EmptyState icon="⊞" text="Referenciá tu trabajo en otras plataformas" onClick={() => onUpdate(p => ({ ...p, portfolio: [...(p.portfolio||[]), { id: Date.now(), label: "", url: "" }] }))} btnText="Agregar link" />
      )}
      {(data.portfolio || []).map(item => (
        <div className="card" key={item.id}>
          <div className="card-header">
            <div className="card-title">{item.label || "Nuevo link"}</div>
            <button className="icon-btn danger" onClick={() => onUpdate(p => ({ ...p, portfolio: p.portfolio.filter(x => x.id !== item.id) }))}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Plataforma o nombre</label><input placeholder="Behance, Dribbble, GitHub..." value={item.label} onChange={e => onUpdate(p => ({ ...p, portfolio: p.portfolio.map(x => x.id === item.id ? { ...x, label: e.target.value } : x) }))} /></div>
            <div className="form-group"><label>URL</label><input placeholder="https://behance.net/tuusuario" value={item.url} onChange={e => onUpdate(p => ({ ...p, portfolio: p.portfolio.map(x => x.id === item.id ? { ...x, url: e.target.value } : x) }))} /></div>
          </div>
        </div>
      ))}
    </>
  );

  // ── CERTS ──
  if (active === "certs") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Certificaciones</div><div className="section-subtitle">{data.certs?.length || 0} certificados</div></div>
        <button className="btn btn-accent btn-sm" onClick={() => addE("certs")}>+ Agregar</button>
      </div>
      {(!data.certs || data.certs.length === 0) && <EmptyState icon="✦" text="Agregá tus certificaciones" onClick={() => addE("certs")} btnText="Agregar certificación" />}
      {data.certs?.map(cert => (
        <div className="card" key={cert.id}>
          <div className="card-header">
            <div className="card-title">{cert.name || "Nueva certificación"}</div>
            <button className="icon-btn danger" onClick={() => rmE("certs", cert.id)}>✕</button>
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Nombre del certificado</label><input placeholder="AWS Solutions Architect" value={cert.name} onChange={e => upE("certs", cert.id, "name", e.target.value)} /></div>
            <div className="form-group"><label>Organización emisora</label><input placeholder="Amazon, Google, Coursera..." value={cert.issuer} onChange={e => upE("certs", cert.id, "issuer", e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Fecha</label><input placeholder="2023" value={cert.date} onChange={e => upE("certs", cert.id, "date", e.target.value)} /></div>
            <div className="form-group"><label>URL del certificado</label><input placeholder="https://..." value={cert.url} onChange={e => upE("certs", cert.id, "url", e.target.value)} /></div>
          </div>
        </div>
      ))}
    </>
  );

  // ── PROJECTS ──
  if (active === "projects") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Proyectos</div><div className="section-subtitle">Side projects, open source</div></div>
        <button className="btn btn-accent btn-sm" onClick={() => addE("projects")}>+ Agregar</button>
      </div>
      {data.projects.length === 0 && <EmptyState icon="◑" text="Mostrá lo que construiste" onClick={() => addE("projects")} btnText="Agregar proyecto" />}
      {data.projects.map(proj => (
        <div className="card" key={proj.id}>
          <div className="card-header">
            <div className="card-title">{proj.name || "Nuevo proyecto"}</div>
            <button className="icon-btn danger" onClick={() => rmE("projects", proj.id)}>✕</button>
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group"><label>Nombre</label><input placeholder="CVLive" value={proj.name} onChange={e => upE("projects", proj.id, "name", e.target.value)} /></div>
            <div className="form-group"><label>URL</label><input placeholder="github.com/..." value={proj.url} onChange={e => upE("projects", proj.id, "url", e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Descripción</label><textarea placeholder="Plataforma de CVs en vivo..." value={proj.desc} onChange={e => upE("projects", proj.id, "desc", e.target.value)} /></div>
        </div>
      ))}
    </>
  );

  // ── LANGUAGES ──
  if (active === "languages") return (
    <>
      <div className="section-header">
        <div><div className="section-title">Idiomas</div><div className="section-subtitle">{data.languages.length} idiomas</div></div>
      </div>
      <div className="form-group">
        <label>Agregar idioma</label>
        <div className="tag-input-row">
          <input placeholder="Español nativo, Inglés C1..." value={langIn} onChange={e => setLangIn(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag("languages", langIn, setLangIn)} />
          <button className="btn btn-accent btn-sm" onClick={() => addTag("languages", langIn, setLangIn)}>+</button>
        </div>
      </div>
      <div className="tags-wrap">
        {data.languages.map(l => <div className="tag" key={l}>{l} <span className="tag-remove" onClick={() => rmTag("languages", l)}>✕</span></div>)}
      </div>
    </>
  );

  return null;
}