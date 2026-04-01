export default function CVPreview({ data, onExport, onShare }) {
  return (
    <aside className="preview-panel">
      <div className="preview-topbar">
        <span className="preview-topbar-title"><span className="live-dot" />Live Preview</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onExport}>↓ PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={onShare}>🔗</button>
        </div>
      </div>

      <div className="preview-content">
        <div className="cv-preview">
          {data.personal.name
            ? <div className="cv-name">{data.personal.name}</div>
            : <div className="cv-name" style={{ color: "var(--text-muted)" }}>Tu nombre aquí</div>
          }
          {data.personal.title && <div className="cv-title">{data.personal.title}</div>}

          <div className="cv-contacts">
            {data.personal.email    && <span className="cv-contact-item">✉ {data.personal.email}</span>}
            {data.personal.phone    && <span className="cv-contact-item">✆ {data.personal.phone}</span>}
            {data.personal.location && <span className="cv-contact-item">◎ {data.personal.location}</span>}
            {data.personal.linkedin && <span className="cv-contact-item">in {data.personal.linkedin}</span>}
            {data.personal.website  && <span className="cv-contact-item">⊕ {data.personal.website}</span>}
          </div>

          {data.summary && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Resumen</div>
            <p className="cv-summary">{data.summary}</p>
          </>}

          {data.experience?.length > 0 && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Experiencia</div>
            {data.experience.map(exp => (
              <div className="cv-entry" key={exp.id}>
                <div className="cv-entry-header">
                  <div>
                    <div className="cv-entry-title">{exp.role || "Cargo"}</div>
                    <div className="cv-entry-org">{exp.company}</div>
                  </div>
                  <div className="cv-entry-date">{exp.from}{exp.from && " – "}{exp.current ? "Presente" : exp.to}</div>
                </div>
                {exp.desc && <div className="cv-entry-desc">{exp.desc}</div>}
              </div>
            ))}
          </>}

          {data.education?.length > 0 && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Educación</div>
            {data.education.map(edu => (
              <div className="cv-entry" key={edu.id}>
                <div className="cv-entry-header">
                  <div>
                    <div className="cv-entry-title">{edu.degree || "Título"}</div>
                    <div className="cv-entry-org">{edu.school}</div>
                  </div>
                  <div className="cv-entry-date">{edu.from}{edu.from && edu.to && " – "}{edu.to}</div>
                </div>
              </div>
            ))}
          </>}

          {data.skills?.length > 0 && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Skills</div>
            <div className="cv-skills-grid">
              {data.skills.map((s, i) => <span className="cv-skill-tag" key={i}>{s.name || s}</span>)}
            </div>
          </>}

          {data.projects?.length > 0 && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Proyectos</div>
            {data.projects.map(proj => (
              <div className="cv-entry" key={proj.id}>
                <div className="cv-entry-header">
                  <div className="cv-entry-title">{proj.name}</div>
                  {proj.url && <div className="cv-entry-date" style={{ fontSize: 10 }}>{proj.url}</div>}
                </div>
                {proj.desc && <div className="cv-entry-desc">{proj.desc}</div>}
              </div>
            ))}
          </>}

          {data.languages?.length > 0 && <>
            <div className="cv-divider" />
            <div className="cv-section-title">Idiomas</div>
            <div className="cv-skills-grid">
              {data.languages.map(l => <span className="cv-skill-tag" key={l}>{l}</span>)}
            </div>
          </>}

          {!data.personal.name && !data.summary && data.experience?.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
              <div style={{ fontSize: 13 }}>Empezá a completar tu CV<br />y verás el preview aquí</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
