import { useState } from "react";

export default function ShareModal({ data, cvId, onClose }) {
  const [copied, setCopied] = useState(false);
  const slug = (data.personal.name || "tu-nombre")
    .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const link = `${window.location.origin}/cv/${slug}-${cvId?.slice(0,6) || "xxxxx"}`;

  function copy() {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Tu CV está en vivo ✦</h2>
        <p className="modal-sub">Compartí este link. Siempre mostrará la versión más actualizada.</p>
        <div className="link-box">
          <span className={copied ? "link-copied" : ""}>{copied ? "¡Copiado!" : link}</span>
          <button className="btn btn-accent btn-sm" onClick={copy}>{copied ? "✓" : "Copiar"}</button>
        </div>
        <div className="tip-box" style={{ marginBottom: 20 }}>
          <div className="tip-label">✦ PRÓXIMAMENTE</div>
          <div className="tip-text">Analítica de visitas — sabé quién vio tu CV y cuándo.</div>
        </div>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
