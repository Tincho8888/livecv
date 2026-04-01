import { useRef } from "react";
import { signInWithGoogle } from "../services/cvService";
import { parseCVFromPDF } from "../services/aiService";

export default function LandingPage({ session, onNewCv, onImported, onShowAuth, setImporting }) {
  const fileRef = useRef();

  async function handleFile(f) {
    if (!f) return;
    if (!session) { onShowAuth(); return; }
    setImporting(true);
    try {
      const parsed = await parseCVFromPDF(f);
      onImported(parsed);
    } catch (err) {
      console.error("Error al parsear PDF:", err);
      onImported({
        personal: { name: "Error al importar", title: "" },
        summary: "No se pudo extraer el contenido del PDF.",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="landing">
      <div className="landing-eyebrow">Tu CV. En vivo. Con IA.</div>
      <h1 className="landing-title">El CV que <em>trabaja</em><br />mientras vos no</h1>
      <p className="landing-sub">Creá, mejorá con IA y compartí tu CV con un link único. Exportá PDF en 3 temas. Guardado automático en la nube.</p>
      <div className="landing-actions">
        <button className="btn btn-accent btn-lg" onClick={() => session ? onNewCv() : onShowAuth()}>
          ✦ Crear mi CV gratis
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => fileRef.current.click()}>
          📄 Subir mi PDF
        </button>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      <div className="landing-features">
        {[
          { icon: "✦", title: "IA integrada",      desc: "Mejorá cualquier sección con Claude" },
          { icon: "☁", title: "Guardado en nube",  desc: "Accedé desde cualquier dispositivo" },
          { icon: "↓", title: "Export PDF",         desc: "3 temas profesionales ATS-ready" },
          { icon: "🔗", title: "Link público",      desc: "CV en vivo para compartir" },
        ].map(f => (
          <div className="feat" key={f.title}>
            <div className="feat-icon">{f.icon}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
