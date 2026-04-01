import { useState, useEffect } from "react";
import { useParams }           from "react-router-dom";
import { supabase }            from "../lib/supabase";
import { parseCVFromPDF }      from "../services/aiService";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap');`;

const css = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0b; color: #e8e6e1; font-family: 'Inter', sans-serif; min-height: 100vh; -webkit-font-smoothing: antialiased; }
  .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  .card { width: 100%; max-width: 480px; background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 36px; }
  .logo { font-weight: 900; font-size: 22px; letter-spacing: -0.5px; color: #e8e6e1; line-height: 1; display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 28px; }
  .logo-sub { font-weight: 300; font-size: 8px; opacity: 0.5; margin-top: -1px; }
  h1 { font-size: 20px; font-weight: 500; letter-spacing: -0.5px; margin-bottom: 6px; }
  .subtitle { font-size: 13px; color: #6b6a72; line-height: 1.6; margin-bottom: 28px; }
  .company-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-family: 'DM Mono', monospace; color: #c8a96e; border: 1px solid rgba(200,169,110,0.2); background: rgba(200,169,110,0.08); padding: 3px 10px; border-radius: 4px; margin-bottom: 24px; }
  label { display: block; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; color: #6b6a72; margin-bottom: 6px; }
  input, textarea { width: 100%; background: #18181c; border: 1px solid rgba(255,255,255,0.07); border-radius: 4px; color: #e8e6e1; font-family: 'Inter', sans-serif; font-size: 13px; padding: 9px 12px; outline: none; transition: border-color 0.12s; }
  input:focus, textarea:focus { border-color: rgba(200,169,110,0.4); }
  input::placeholder, textarea::placeholder { color: #52514f; }
  textarea { resize: none; line-height: 1.6; min-height: 80px; }
  .field { margin-bottom: 16px; }
  .drop-zone { border: 1.5px dashed rgba(255,255,255,0.1); border-radius: 8px; padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.15s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(200,169,110,0.4); background: rgba(200,169,110,0.04); }
  .drop-zone.has-file { border-color: rgba(76,175,125,0.4); background: rgba(76,175,125,0.04); }
  .btn { width: 100%; padding: 11px; border-radius: 4px; border: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.12s; }
  .btn-primary { background: #c8a96e; color: #0a0a0b; }
  .btn-primary:hover:not(:disabled) { background: #d4b87a; }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
  .error { font-size: 12px; color: #e05c5c; background: rgba(224,92,92,0.08); border: 1px solid rgba(224,92,92,0.2); border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; }
  .success { text-align: center; padding: 20px 0; }
  .success-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 22px; }
  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
  .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #52514f; font-family: 'DM Mono', monospace; }
  .footer a { color: #c8a96e; text-decoration: none; }
  .spinner { width: 14px; height: 14px; border: 1.5px solid rgba(255,255,255,0.1); border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; margin-right: 8px; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function ApplyPage() {
  const { recruiterId } = useParams();
  const [company, setCompany]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [message, setMessage]   = useState("");
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [phase, setPhase]       = useState("form"); // form | parsing | saving | done
  const [error, setError]       = useState("");

  useEffect(() => {
    // Cargar empresa del reclutador
    supabase.from("recruiter_profiles").select("company, accepting_applications").eq("id", recruiterId).maybeSingle()
      .then(({ data }) => {
        if (!data || !data.accepting_applications) { setNotFound(!data ? true : "closed"); }
        else { setCompany(data.company); }
        setLoading(false);
      }).catch(() => { setNotFound(true); setLoading(false); });
  }, [recruiterId]);

  function handleFile(f) {
    if (!f || f.type !== "application/pdf") { setError("Solo se aceptan archivos PDF."); return; }
    setFile(f); setError("");
  }

  async function handleSubmit() {
    if (!file)  { setError("Subí tu CV en PDF."); return; }
    if (!name.trim())  { setError("Ingresá tu nombre."); return; }
    if (!email.trim()) { setError("Ingresá tu email."); return; }

    setPhase("parsing"); setError("");

    try {
      // 1. Parsear CV con IA
      const parsed = await parseCVFromPDF(file);

      // Sobrescribir con los datos del form (más confiables)
      if (parsed.personal) {
        parsed.personal.name    = name.trim()   || parsed.personal.name;
        parsed.personal.email   = email.trim()  || parsed.personal.email;
        parsed.personal.linkedin = linkedin.trim() || parsed.personal.linkedin;
      }

      setPhase("saving");

      // 2. Guardar en Supabase — sin user_id (postulante anónimo)
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        + "-" + Math.random().toString(36).slice(2, 6);

      const { error: insertError } = await supabase.from("cvs").insert({
        title:               `CV — ${name.trim()}`,
        slug,
        data:                parsed,
        is_public:           true,
        source_recruiter_id: recruiterId,
        source_company:      company,
        applicant_message:   message.trim() || null,
      });

      if (insertError) throw insertError;

      // 3. Notificar al pipeline
      window.dispatchEvent(new CustomEvent("pipeline:updated"));

      setPhase("done");
    } catch(e) {
      console.error(e);
      setError("Hubo un error al procesar tu CV. Intentá de nuevo.");
      setPhase("form");
    }
  }

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="page"><div style={{ fontSize: 13, color: "#52514f", fontFamily: "'DM Mono', monospace" }}>Cargando...</div></div>
    </>
  );

  if (notFound === "closed") return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          <h1 style={{ marginBottom: 8, fontSize: 18 }}>Postulaciones cerradas</h1>
          <div style={{ fontSize: 13, color: "#6b6a72", lineHeight: 1.7 }}>
            Esta empresa no está recibiendo postulaciones en este momento.<br/>
            Intentá más tarde.
          </div>
        </div>
      </div>
    </>
  );

  if (notFound) return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#6b6a72", marginBottom: 8 }}>Link no encontrado</div>
          <div style={{ fontSize: 12, color: "#52514f" }}>Este link de postulación no es válido o expiró.</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="card">
          {/* Logo */}
          <div className="logo">
            LIVE<span className="logo-sub">CV</span>
          </div>

          {phase === "done" ? (
            <div className="success">
              <div className="success-icon">✓</div>
              <h1 style={{ marginBottom: 8 }}>¡CV enviado!</h1>
              <p style={{ fontSize: 13, color: "#6b6a72", lineHeight: 1.7, marginBottom: 20 }}>
                Tu postulación fue recibida por <strong style={{ color: "#e8e6e1" }}>{company}</strong>.<br/>
                Si tu perfil encaja, van a contactarte.
              </p>
              <div style={{ fontSize: 11, color: "#52514f", fontFamily: "'DM Mono', monospace" }}>
                Podés cerrar esta ventana.
              </div>
            </div>
          ) : (
            <>
              <h1>Enviá tu postulación</h1>
              <p className="subtitle">Tu CV será analizado por IA y revisado por el equipo de {company}.</p>
              <div className="company-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="1" y="1" width="3.5" height="3.5" rx="0.7" fill="#c8a96e"/>
                  <rect x="5.5" y="1" width="3.5" height="3.5" rx="0.7" fill="#c8a96e" opacity="0.4"/>
                  <rect x="1" y="5.5" width="3.5" height="3.5" rx="0.7" fill="#c8a96e" opacity="0.4"/>
                  <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.7" fill="#c8a96e" opacity="0.6"/>
                </svg>
                {company}
              </div>

              {error && <div className="error">{error}</div>}

              {/* Datos personales */}
              <div className="field">
                <label>Nombre completo *</label>
                <input placeholder="María García" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" placeholder="maria@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>LinkedIn</label>
                <input placeholder="linkedin.com/in/mariagarcia" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>

              <div className="divider" />

              {/* Upload CV */}
              <div className="field">
                <label>CV en PDF *</label>
                <div
                  className={`drop-zone ${dragOver ? "over" : ""} ${file ? "has-file" : ""}`}
                  onClick={() => document.getElementById("cv-file-input").click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                >
                  <input id="cv-file-input" type="file" accept=".pdf" style={{ display: "none" }}
                    onChange={e => handleFile(e.target.files[0])} />
                  {file ? (
                    <>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
                      <div style={{ fontSize: 13, color: "#4caf7d", fontWeight: 500 }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: "#52514f", marginTop: 4 }}>Clic para cambiar</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.4 }}>↑</div>
                      <div style={{ fontSize: 13, color: "#9e9b96" }}>Arrastrá tu CV o hacé clic para subir</div>
                      <div style={{ fontSize: 11, color: "#52514f", marginTop: 4 }}>Solo PDF · máx 10MB</div>
                    </>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              <div className="field">
                <label>Mensaje para el equipo <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                <textarea placeholder="¿Por qué te interesa esta posición?..."
                  value={message} onChange={e => setMessage(e.target.value)} />
              </div>

              <button className="btn btn-primary" onClick={handleSubmit}
                disabled={phase === "parsing" || phase === "saving"}>
                {phase === "parsing" && <><span className="spinner" />Analizando tu CV con IA...</>}
                {phase === "saving"  && <><span className="spinner" />Enviando postulación...</>}
                {phase === "form"    && "Enviar postulación →"}
              </button>
            </>
          )}
        </div>

        <div className="footer">
          Impulsado por <a href="https://livecv.app">LiveCV</a> · Tu CV, en vivo.
        </div>
      </div>
    </>
  );
}