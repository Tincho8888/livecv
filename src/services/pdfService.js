// ─── PDF EXPORT SERVICE ───────────────────────────────────

export async function exportVisualPDF(data) {
  const d = data, p = d.personal || {};
  const safeName = (p.name || "CV").replace(/\s+/g, "_");

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, margin = 14, col = W - margin * 2;
  let y = 0;

  const nl = (n = 5) => { y += n; if (y > 280) { pdf.addPage(); y = 14; } };
  const h2r = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const CREAM = "#efede8", ACCENT = "#9a7840", INK = "#1a1a18", MUTED = "#7a7870", SOFT = "#3d3b35";

  pdf.setFillColor(...h2r(CREAM));
  pdf.rect(0, 0, W, 50, "F");

  if (p.avatar) {
    try {
      const res = await fetch(p.avatar);
      const blob = await res.blob();
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      pdf.addImage(b64, "JPEG", W - margin - 22, 7, 22, 22, undefined, "FAST");
    } catch {}
  }

  y = 14;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(22); pdf.setTextColor(...h2r(INK));
  pdf.text(p.name || "", margin, y); nl(8);

  if (p.title) {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...h2r(ACCENT));
    pdf.text(p.title.toUpperCase(), margin, y); nl(6);
  }

  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  if (contacts.length) {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...h2r(MUTED));
    pdf.text(contacts.join("   ·   "), margin, y, { maxWidth: col - 24 }); nl(6);
  }

  y = 54;
  pdf.setDrawColor(...h2r("#d8d5cf")); pdf.setLineWidth(0.3); pdf.line(0, y, W, y); nl(8);

  const sec = (t) => {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...h2r(ACCENT));
    pdf.text(t.toUpperCase(), margin, y);
    pdf.setDrawColor(...h2r(ACCENT)); pdf.setLineWidth(0.2);
    pdf.line(margin + pdf.getTextWidth(t.toUpperCase()) + 3, y - 0.5, W - margin, y - 0.5);
    nl(7);
  };

  const body = (text, size = 10, color = SOFT) => {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(size); pdf.setTextColor(...h2r(color));
    pdf.splitTextToSize(text, col).forEach(line => {
      if (y > 280) { pdf.addPage(); y = 14; }
      pdf.text(line, margin, y); y += size * 0.42;
    });
    nl(1);
  };

  if (d.summary) { sec("Resumen"); body(d.summary); }

  if (d.experience?.length) {
    sec("Experiencia");
    [...d.experience].sort((a, b) => a.current ? -1 : b.current ? 1 : 0).forEach(exp => {
      if (y > 265) { pdf.addPage(); y = 14; }
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...h2r(INK));
      pdf.text(exp.role || "", margin, y);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...h2r(MUTED));
      pdf.text(`${exp.from || ""}${exp.from ? " – " : ""}${exp.current ? "Presente" : (exp.to || "")}`, W - margin, y, { align: "right" });
      nl(5);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...h2r(ACCENT));
      pdf.text(exp.company || "", margin, y); nl(5);
      if (exp.desc) body(exp.desc, 9.5, SOFT);
      nl(2);
    });
  }

  if (d.education?.length) {
    sec("Educación");
    d.education.forEach(edu => {
      if (y > 270) { pdf.addPage(); y = 14; }
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...h2r(INK));
      pdf.text(edu.degree || "", margin, y);
      const yr = `${edu.from || ""}${edu.from && edu.to ? " – " : ""}${edu.to || ""}`;
      if (yr) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...h2r(MUTED)); pdf.text(yr, W - margin, y, { align: "right" }); }
      nl(5);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...h2r(ACCENT));
      pdf.text(edu.school || "", margin, y); nl(6);
    });
  }

  if (d.skills?.length) {
    sec("Skills");
    let x = margin;
    d.skills.map(s => s.name || s).forEach(name => {
      const tw = pdf.setFontSize(8).getTextWidth(name) + 6;
      if (x + tw > W - margin) { x = margin; nl(7); }
      if (y > 280) { pdf.addPage(); y = 14; x = margin; }
      pdf.setFillColor(...h2r("#f0ede8")); pdf.setDrawColor(...h2r("#c8c5be"));
      pdf.roundedRect(x, y - 4, tw, 6, 1.5, 1.5, "FD");
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...h2r(SOFT));
      pdf.text(name, x + 3, y); x += tw + 3;
    });
    nl(8);
  }

  if (d.certs?.length) {
    sec("Certificaciones");
    d.certs.forEach(c => {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...h2r(INK));
      pdf.text(c.name || "", margin, y);
      if (c.date) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(...h2r(MUTED)); pdf.text(c.date, W - margin, y, { align: "right" }); }
      nl(5);
      if (c.issuer) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...h2r(ACCENT)); pdf.text(c.issuer, margin, y); nl(5); }
    });
  }

  if (d.languages?.length) { sec("Idiomas"); body(d.languages.join("   ·   ")); }

  pdf.save(`${safeName}_CV_Visual.pdf`);
}

export async function exportAIPDF(data) {
  const d = data, p = d.personal || {};
  const safeName = (p.name || "CV").replace(/\s+/g, "_");

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 18, lh = 6, col = 174;
  let y = margin;

  const txt = (text, size, bold, rgb) => {
    size = size || 10; bold = bold || false; rgb = rgb || [30, 30, 30];
    pdf.setFontSize(size); pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setTextColor(...rgb);
    pdf.splitTextToSize(String(text || ""), col).forEach(line => {
      if (y > 277) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y); y += lh;
    });
  };

  const sec = (t) => {
    y += 4;
    pdf.setDrawColor(200, 200, 200); pdf.line(margin, y, 192, y); y += 5;
    txt(t, 8, true, [140, 140, 140]); y += 1;
  };

  txt(p.name || "", 20, true, [10, 10, 10]); y += 1;
  txt(p.title || "", 11, false, [80, 80, 80]); y += 2;
  txt([p.email, p.phone, p.location].filter(Boolean).join("  |  "), 9, false, [100, 100, 100]);
  if (p.linkedin || p.github) txt([p.linkedin, p.github].filter(Boolean).join("  |  "), 9, false, [100, 100, 100]);

  if (d.summary) { sec("SUMMARY"); txt(d.summary, 10); }

  if (d.experience?.length) {
    sec("EXPERIENCE");
    d.experience.forEach(e => {
      txt(e.role + "  —  " + e.company, 11, true);
      txt(e.from + " – " + (e.current ? "Present" : e.to), 9, false, [120, 120, 120]);
      if (e.desc) { y += 1; txt(e.desc, 9, false, [60, 60, 60]); }
      y += 2;
    });
  }

  if (d.skills?.length) {
    sec("SKILLS");
    const cats = { language: [], framework: [], tool: [] };
    d.skills.forEach(s => cats[s.category || "tool"].push(s.name || s));
    if (cats.language.length) txt("Languages: " + cats.language.join(", "), 10);
    if (cats.framework.length) txt("Frameworks: " + cats.framework.join(", "), 10);
    if (cats.tool.length) txt("Tools: " + cats.tool.join(", "), 10);
  }

  if (d.education?.length) {
    sec("EDUCATION");
    d.education.forEach(e => {
      txt(e.degree + "  —  " + e.school, 10, true);
      txt((e.from || "") + (e.to ? " – " + e.to : e.current ? " – Present" : ""), 9, false, [120, 120, 120]);
      y += 1;
    });
  }

  if (d.certs?.length) {
    sec("CERTIFICATIONS");
    d.certs.forEach(c => txt(c.name + "  ·  " + (c.issuer || "") + "  ·  " + (c.date || ""), 10));
  }

  if (d.languages?.length) { sec("LANGUAGES"); txt(d.languages.join(", "), 10); }

  pdf.save(`${safeName}_CV_ATS.pdf`);
}