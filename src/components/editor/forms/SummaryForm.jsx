export default function SummaryForm({ cvData, onChange }) {
  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Resumen</div>
          <div className="e-section-subtitle">2–4 oraciones que te venden</div>
        </div>
        <button className="e-btn e-btn-ghost e-btn-sm" disabled>✦ Mejorar con IA</button>
      </div>

      <div className="e-form-group">
        <label className="e-label">Resumen profesional</label>
        <textarea
          className="e-input e-textarea"
          rows={6}
          placeholder="Desarrollador full-stack con 6 años de experiencia en React y Node.js..."
          value={cvData.summary || ''}
          onChange={e => onChange(prev => ({ ...prev, summary: e.target.value }))}
        />
      </div>

      <div className="e-ai-box">
        <div className="e-ai-box-label">✦ IA PRÓXIMAMENTE</div>
        <div className="e-ai-box-text">Pegá una oferta de trabajo y optimizamos tu resumen para ese rol específico.</div>
      </div>
    </>
  )
}
