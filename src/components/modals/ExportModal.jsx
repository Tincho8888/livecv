import { useState } from "react";
import { THEMES } from "../../lib/cvDefaults";

// ─── PDF SUBCOMPONENTS ────────────────────────────────────
function PdfSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22, pageBreakInside: "avoid" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: accent, letterSpacing: 3, textTransform: "uppercase" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: accent + "44" }} />
      </div>
      {children}
    </div>
  );
}

function PdfDoc({ data, t }) {
  const contacts = [
    data.personal.email    && `✉ ${data.personal.email}`,
    data.personal.phone    && `✆ ${data.personal.phone}`,
    data.personal.location && `◎ ${data.personal.location}`,
    data.personal.linkedin && `in ${data.personal.linkedin}`,
    data.personal.website  && `⊕ ${data.personal.website}`,
  ].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Crimson Pro',serif", background: t.bg, color: t.text, width: "210mm", minHeight: "297mm", margin: "0 auto" }}>
      <style>{`
        @media print {
          #pdf-root { background: ${t.bg} !important; }
          #pdf-root * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <div style={{ background: t.headerBg, padding: "38px 46px 30px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, color: t.text }}>{data.personal.name || "Tu Nombre"}</div>
            {data.personal.title && <div style={{ fontSize: 11, color: t.accent, fontWeight: 600, marginTop: 6, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>{data.personal.title}</div>}
            {contacts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14 }}>
                {contacts.map((c, i) => <span key={i} style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono',monospace" }}>{c}</span>)}
              </div>
            )}
          </div>
          {data.personal.avatar && (
            <img src={data.personal.avatar} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${t.border}` }} crossOrigin="anonymous" />
          )}
        </div>
      </div>
      <div style={{ padding: "30px 46px", background: t.bg }}>
        {data.summary && <PdfSection title="Resumen" accent={t.accent}><p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.78 }}>{data.summary}</p></PdfSection>}
        {data.experience?.length > 0 && (
          <PdfSection title="Experiencia" accent={t.accent}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display',serif", color: t.text }}>{exp.role}</div>
                    <div style={{ fontSize: 12, color: t.accent, marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{exp.company}</div>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono',monospace" }}>{exp.from}{exp.from && " – "}{exp.current ? "Presente" : exp.to}</div>
                </div>
                {exp.desc && <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.65, marginTop: 7 }}>{exp.desc}</p>}
              </div>
            ))}
          </PdfSection>
        )}
        {data.education?.length > 0 && (
          <PdfSection title="Educación" accent={t.accent}>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{edu.degree}</div>
                  <div style={{ fontSize: 12, color: t.accent, fontFamily: "'DM Mono',monospace" }}>{edu.school}</div>
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono',monospace" }}>{edu.from}{edu.from && edu.to && " – "}{edu.to}</div>
              </div>
            ))}
          </PdfSection>
        )}
        {data.skills?.length > 0 && (
          <PdfSection title="Skills" accent={t.accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", background: t.skillBg, border: `1px solid ${t.skillBorder}`, color: t.textSoft, padding: "3px 10px", borderRadius: 4 }}>{s.name || s}</span>
              ))}
            </div>
          </PdfSection>
        )}
        {data.certs?.length > 0 && (
          <PdfSection title="Certificaciones" accent={t.accent}>
            {data.certs.map((c, i) => (
              <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: t.accent, fontFamily: "'DM Mono',monospace" }}>{c.issuer}{c.date ? ` · ${c.date}` : ""}</div>
                </div>
                {c.url && <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono',monospace" }}>{c.url}</div>}
              </div>
            ))}
          </PdfSection>
        )}
        {data.projects?.length > 0 && (
          <PdfSection title="Proyectos" accent={t.accent}>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{proj.name}</div>
                  {proj.url && <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono',monospace" }}>{proj.url}</div>}
                </div>
                {proj.desc && <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.65, marginTop: 5 }}>{proj.desc}</p>}
              </div>
            ))}
          </PdfSection>
        )}
        {data.languages?.length > 0 && (
          <PdfSection title="Idiomas" accent={t.accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.languages.map((l, i) => (
                <span key={i} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", background: t.skillBg, border: `1px solid ${t.skillBorder}`, color: t.textSoft, padding: "3px 10px", borderRadius: 4 }}>{l}</span>
              ))}
            </div>
          </PdfSection>
        )}
      </div>
    </div>
  );
}

function ThemeMini({ id }) {
  if (id === "dark") return (
    <div style={{ background: "#0a0a0b", height: "100%" }}>
      <div style={{ background: "#111113", height: "30%", padding: 8 }}>
        <div style={{ background: "#c8a96e", height: 3, width: "65%", borderRadius: 2, marginBottom: 5 }} />
        <div style={{ background: "rgba(200,169,110,0.3)", height: 2, width: "40%", borderRadius: 2 }} />
      </div>
      <div style={{ padding: 8 }}>
        {[100,68,82,55,72].map((w,i) => <div key={i} style={{ background: "rgba(255,255,255,0.07)", height: 2, width: w+"%", borderRadius: 2, marginBottom: 5 }} />)}
      </div>
    </div>
  );
  if (id === "light") return (
    <div style={{ background: "#faf9f7", height: "100%" }}>
      <div style={{ background: "#f0ede8", height: "30%", padding: 8, borderBottom: "1px solid #e0ddd8" }}>
        <div style={{ background: "#1a1a1a", height: 3, width: "60%", borderRadius: 2, marginBottom: 5 }} />
        <div style={{ background: "#c8a96e", height: 2, width: "38%", borderRadius: 2 }} />
      </div>
      <div style={{ padding: 8 }}>
        {[100,68,82,55,72].map((w,i) => <div key={i} style={{ background: "#e0ddd8", height: 2, width: w+"%", borderRadius: 2, marginBottom: 5 }} />)}
      </div>
    </div>
  );
  return (
    <div style={{ background: "#fff", height: "100%" }}>
      <div style={{ padding: 8, height: "25%" }}>
        <div style={{ background: "#111", height: 4, width: "58%", borderRadius: 2, marginBottom: 6 }} />
        <div style={{ background: "#ccc", height: 1, width: "100%", marginBottom: 5 }} />
      </div>
      <div style={{ padding: 8 }}>
        {[100,65,78,52,70].map((w,i) => <div key={i} style={{ background: "#eee", height: 2, width: w+"%", borderRadius: 2, marginBottom: 5 }} />)}
      </div>
    </div>
  );
}

// ─── EXPORT MODAL ─────────────────────────────────────────
export default function ExportModal({ data, onClose }) {
  const [theme, setTheme]   = useState("light");
  const [mode, setMode]     = useState("visual");
  const [phase, setPhase]   = useState("options");
  const [stepTxt, setStepTxt] = useState("");


  function buildPdfHtml(d, t) {
    const contacts = [
      d.personal.email    && `✉ ${d.personal.email}`,
      d.personal.phone    && `✆ ${d.personal.phone}`,
      d.personal.location && `◎ ${d.personal.location}`,
      d.personal.linkedin && `in ${d.personal.linkedin}`,
      d.personal.github   && `⌥ ${d.personal.github}`,
      d.personal.website  && `⊕ ${d.personal.website}`,
    ].filter(Boolean);

    const sec = (title, inner) => `
      <div style="margin-bottom:22px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:13px;">
          <span style="font-size:10px;font-family:'DM Mono',monospace;color:${t.accent};letter-spacing:3px;text-transform:uppercase;">${title}</span>
          <div style="flex:1;height:1px;background:${t.accent}44;"></div>
        </div>
        ${inner}
      </div>`;

    const summaryHtml = d.summary ? sec("Resumen", `<p style="font-size:13px;color:${t.textSoft};line-height:1.78;margin:0;">${d.summary}</p>`) : "";

    const expHtml = d.experience?.length ? sec("Experiencia", d.experience.map(exp => `
      <div style="margin-bottom:18px;page-break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-size:15px;font-weight:700;font-family:'Playfair Display',serif;color:${t.text};">${exp.role||""}</div>
            <div style="font-size:12px;color:${t.accent};margin-top:2px;font-family:'DM Mono',monospace;">${exp.company||""}</div>
          </div>
          <div style="font-size:11px;color:${t.textMuted};font-family:'DM Mono',monospace;white-space:nowrap;margin-left:12px;">${exp.from||""}${exp.from?" – ":""}${exp.current?"Presente":(exp.to||"")}</div>
        </div>
        ${exp.desc ? `<p style="font-size:12px;color:${t.textSoft};line-height:1.65;margin-top:7px;">${exp.desc}</p>` : ""}
      </div>`).join("")) : "";

    const eduHtml = d.education?.length ? sec("Educación", d.education.map(edu => `
      <div style="margin-bottom:14px;display:flex;justify-content:space-between;page-break-inside:avoid;">
        <div>
          <div style="font-size:14px;font-weight:700;color:${t.text};">${edu.degree||""}</div>
          <div style="font-size:12px;color:${t.accent};margin-top:2px;font-family:'DM Mono',monospace;">${edu.school||""}</div>
        </div>
        <div style="font-size:11px;color:${t.textMuted};font-family:'DM Mono',monospace;white-space:nowrap;margin-left:12px;">${edu.from||""}${edu.from&&edu.to?" – ":""}${edu.to||""}</div>
      </div>`).join("")) : "";

    const skillsHtml = d.skills?.length ? sec("Skills", `
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${d.skills.map(s => `<span style="font-size:11px;font-family:'DM Mono',monospace;background:${t.skillBg};border:1px solid ${t.skillBorder};color:${t.textSoft};padding:3px 10px;border-radius:4px;">${s.name||s}</span>`).join("")}
      </div>`) : "";

    const certsHtml = d.certs?.length ? sec("Certificaciones", d.certs.map(c => `
      <div style="margin-bottom:10px;display:flex;justify-content:space-between;page-break-inside:avoid;">
        <div>
          <div style="font-size:13px;font-weight:700;color:${t.text};">${c.name||""}</div>
          <div style="font-size:11px;color:${t.accent};font-family:'DM Mono',monospace;">${c.issuer||""}${c.date?` · ${c.date}`:""}</div>
        </div>
        ${c.url?`<div style="font-size:10px;color:${t.textMuted};font-family:'DM Mono',monospace;">${c.url}</div>`:""}
      </div>`).join("")) : "";

    const projHtml = d.projects?.length ? sec("Proyectos", d.projects.map(proj => `
      <div style="margin-bottom:14px;page-break-inside:avoid;">
        <div style="display:flex;justify-content:space-between;">
          <div style="font-size:14px;font-weight:700;color:${t.text};">${proj.name||""}</div>
          ${proj.url?`<div style="font-size:11px;color:${t.textMuted};font-family:'DM Mono',monospace;">${proj.url}</div>`:""}
        </div>
        ${proj.desc?`<p style="font-size:12px;color:${t.textSoft};line-height:1.65;margin-top:5px;">${proj.desc}</p>`:""}
      </div>`).join("")) : "";

    const langHtml = d.languages?.length ? sec("Idiomas", `
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${d.languages.map(l => `<span style="font-size:11px;font-family:'DM Mono',monospace;background:${t.skillBg};border:1px solid ${t.skillBorder};color:${t.textSoft};padding:3px 10px;border-radius:4px;">${l}</span>`).join("")}
      </div>`) : "";

    const avatarHtml = d.personal.avatar
      ? `<img src="${d.personal.avatar}" crossorigin="anonymous" style="width:88px;height:88px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${t.border};" />`
      : "";

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${d.personal.name||"CV"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.bg}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  @page { size: A4 portrait; margin: 0; }
  @media print {
    .no-print { display: none !important; }
    body { background: ${t.bg} !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
  .print-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 999; background: #1a1a1a; color: #fff; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 12px; }
  .print-bar button { background: #c8a96e; color: #000; border: none; padding: 7px 18px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Mono', monospace; }
  .print-tip { opacity: 0.6; font-size: 11px; }
  .cv-wrap { width: 210mm; margin: 0 auto; padding-top: 44px; background: ${t.bg}; }
</style>
</head>
<body>
<div class="print-bar no-print">
  <div>
    <span style="font-weight:600;margin-right:16px;">LIVECV — Exportar PDF</span>
    <span class="print-tip">Márgenes: Ninguno · Escala: 100% · Sin encabezados</span>
  </div>
  <button onclick="window.print()">Imprimir / Guardar PDF</button>
</div>
<div class="cv-wrap">
  <div style="background:${t.headerBg||t.bg};padding:38px 46px 30px;border-bottom:1px solid ${t.border};">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
      <div style="flex:1;">
        <div style="font-family:'Playfair Display',serif;font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1.05;color:${t.text};">${d.personal.name||"Tu Nombre"}</div>
        ${d.personal.title?`<div style="font-size:11px;color:${t.accent};font-weight:600;margin-top:6px;letter-spacing:2.5px;text-transform:uppercase;font-family:'DM Mono',monospace;">${d.personal.title}</div>`:""}
        ${contacts.length?`<div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:14px;">${contacts.map(c=>`<span style="font-size:11px;color:${t.textMuted};font-family:'DM Mono',monospace;">${c}</span>`).join("")}</div>`:""}
      </div>
      ${avatarHtml}
    </div>
  </div>
  <div style="padding:30px 46px;background:${t.bg};">
    ${summaryHtml}${expHtml}${eduHtml}${skillsHtml}${certsHtml}${projHtml}${langHtml}
  </div>
</div>
</body>
</html>`;
  }

  async function handleVisualExport() {
    setPhase("generating");
    setStepTxt("Generando documento...");
    await new Promise(r => setTimeout(r, 300));

    let patchedData = data;
    if (data.personal?.avatar) {
      try {
        const resp = await fetch(data.personal.avatar);
        const blob = await resp.blob();
        const b64 = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
        patchedData = { ...data, personal: { ...data.personal, avatar: b64 } };
      } catch { /* skip */ }
    }

    try {
      const html = buildPdfHtml(patchedData, THEMES[theme]);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setPhase("done");
    } catch (err) {
      console.error(err);
      setPhase("options");
    }
  }

  async function handleAtsExport() {
    setPhase("generating");
    setStepTxt("Generando CV ATS...");
    await new Promise(r => setTimeout(r, 400));
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const L = 20; const R = 190; const W = R - L;
      let y = 20;

      const nl = (n = 6) => { y += n; if (y > 270) { pdf.addPage(); y = 20; } };
      const line = (x1, x2, yy) => { pdf.setDrawColor(180); pdf.setLineWidth(0.3); pdf.line(x1, yy, x2, yy); };

      pdf.setFont("helvetica", "bold"); pdf.setFontSize(22); pdf.setTextColor(20,20,20);
      pdf.text((data.personal.name || "").toUpperCase(), L, y); nl(7);

      if (data.personal.title) {
        pdf.setFont("helvetica","normal"); pdf.setFontSize(11); pdf.setTextColor(100,80,40);
        pdf.text(data.personal.title.toUpperCase(), L, y); nl(6);
      }

      const contacts = [data.personal.email, data.personal.phone, data.personal.location, data.personal.linkedin, data.personal.website].filter(Boolean);
      if (contacts.length) {
        pdf.setFont("helvetica","normal"); pdf.setFontSize(9); pdf.setTextColor(80,80,80);
        pdf.text(contacts.join("   |   "), L, y); nl(4);
      }
      line(L, R, y); nl(8);

      const section = (title) => {
        pdf.setFont("helvetica","bold"); pdf.setFontSize(9); pdf.setTextColor(140,100,50);
        pdf.text(title.toUpperCase(), L, y); nl(2); line(L, R, y); nl(6);
      };
      const body = (text, indent = 0) => {
        pdf.setFont("helvetica","normal"); pdf.setFontSize(10); pdf.setTextColor(40,40,40);
        pdf.splitTextToSize(text, W - indent).forEach(ln => { pdf.text(ln, L + indent, y); nl(5); });
      };

      if (data.summary) { section("Resumen"); body(data.summary); nl(2); }

      if (data.experience?.length) {
        section("Experiencia");
        [...data.experience].sort((a,b) => { if (a.current) return -1; if (b.current) return 1; return 0; })
          .forEach(exp => {
            const dateStr = `${exp.from||""}${exp.from?" – ":""}${exp.current?"Presente":(exp.to||"")}`;
            pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.setTextColor(20,20,20); pdf.text(exp.role||"", L, y);
            pdf.setFont("helvetica","normal"); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(dateStr, R, y, { align: "right" }); nl(5);
            pdf.setFont("helvetica","normal"); pdf.setFontSize(10); pdf.setTextColor(140,100,50); pdf.text(exp.company||"", L, y); nl(5);
            if (exp.desc) body(exp.desc); nl(3);
          });
      }

      if (data.education?.length) {
        section("Educación");
        data.education.forEach(edu => {
          pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.setTextColor(20,20,20); pdf.text(edu.degree||"", L, y);
          const yr = `${edu.from||""}${edu.from&&edu.to?" – ":""}${edu.to||""}`;
          if (yr) { pdf.setFont("helvetica","normal"); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(yr, R, y, { align: "right" }); }
          nl(5); pdf.setFont("helvetica","normal"); pdf.setFontSize(10); pdf.setTextColor(140,100,50); pdf.text(edu.school||"", L, y); nl(6);
        });
      }

      if (data.certs?.length) {
        section("Certificaciones");
        data.certs.forEach(c => {
          pdf.setFont("helvetica","bold"); pdf.setFontSize(10); pdf.setTextColor(20,20,20); pdf.text(c.name||"", L, y);
          if (c.date) { pdf.setFont("helvetica","normal"); pdf.setFontSize(9); pdf.setTextColor(100,100,100); pdf.text(c.date, R, y, { align: "right" }); }
          nl(5);
          if (c.issuer) { pdf.setFont("helvetica","normal"); pdf.setFontSize(10); pdf.setTextColor(140,100,50); pdf.text(c.issuer, L, y); nl(5); }
        });
        nl(2);
      }

      if (data.skills?.length) {
        section("Skills");
        const skillNames = [...data.skills].sort((a,b) => (b.level||3)-(a.level||3)).map(s => {
          const n = s.name||s; const lvl = s.level||3;
          const sen = lvl>=5?"SR":lvl===4?"SSR":lvl>=2?"JR":"TR";
          return `${n} (${sen})`;
        });
        body(skillNames.join(" · ")); nl(2);
      }

      if (data.languages?.length) { section("Idiomas"); body(data.languages.join(" · ")); }

      const name = (data.personal.name||"cv").toLowerCase().replace(/\s+/g,"-");
      pdf.save(`${name}-ats.pdf`);
      setPhase("done");
    } catch (err) { console.error(err); setPhase("options"); }
  }

  function handleExport() { mode === "ats" ? handleAtsExport() : handleVisualExport(); }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        {phase === "options" && <>
          <h2>Exportar PDF</h2>
          <p className="modal-sub">Elegí el tipo de PDF según dónde lo vas a usar.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { id: "visual", icon: "🎨", title: "Visual", desc: "Diseño con colores y tipografía. Para enviar por email o compartir." },
              { id: "ats",    icon: "🤖", title: "ATS / IA", desc: "Texto limpio, sin imágenes. Compatible con Greenhouse, Lever, Workday." },
            ].map(opt => (
              <div key={opt.id} onClick={() => setMode(opt.id)} style={{ padding: "14px 16px", border: `2px solid ${mode===opt.id?"var(--accent)":"var(--border)"}`, borderRadius: "var(--radius-sm)", cursor: "pointer", background: mode===opt.id?"var(--accent-glow)":"transparent", transition: "all 0.15s" }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{opt.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>

          {mode === "visual" && <>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Tema visual</div>
            <div className="theme-grid">
              {Object.entries(THEMES).map(([key, th]) => (
                <div key={key} className={`theme-card ${theme===key?"selected":""}`} onClick={() => setTheme(key)}>
                  <div className="theme-preview"><ThemeMini id={key} /></div>
                  <div className="theme-name">{th.name}</div>
                  <div className="theme-desc">{th.desc}</div>
                </div>
              ))}
            </div>
          </>}

          {mode === "ats" && (
            <div style={{ padding: "12px 14px", background: "rgba(76,175,125,0.06)", border: "1px solid rgba(76,175,125,0.2)", borderRadius: "var(--radius-sm)", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--green)", marginBottom: 4 }}>✓ ATS OPTIMIZADO</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Texto 100% seleccionable, estructura lineal, sin columnas ni imágenes. Skills con nivel de seniority incluido.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-accent" style={{ flex: 2 }} onClick={handleExport}>↓ Descargar {mode==="ats"?"ATS PDF":"PDF"}</button>
          </div>
        </>}

        {phase === "generating" && (
          <div className="export-generating">
            <div className="export-spinner" />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 10 }}>Generando PDF</div>
            <div className="export-step-text">{stepTxt}</div>
          </div>
        )}

        {phase === "done" && (
          <div className="export-done">
            <div className="export-done-icon">✦</div>
            <h3>¡PDF descargado!</h3>
            <p>{mode==="ats"?"Tu CV ATS está listo para subir a Greenhouse, Lever o cualquier portal.":"Se abrió una nueva pestaña. Usá Ctrl+P (o Cmd+P) → Guardar como PDF. Márgenes: Ninguno, Escala: 100%."}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cerrar</button>
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => setPhase("options")}>Otro formato</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}