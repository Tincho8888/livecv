import { newEducation, EDUCATION_TYPES, EDUCATION_STATUS } from '../../../lib/cvDefaults'

export default function EducationForm({ cvData, onChange }) {
  const list = cvData.education || []

  function add() {
    onChange(prev => ({ ...prev, education: [...prev.education, newEducation()] }))
  }

  function update(id, key, val) {
    onChange(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [key]: val } : e)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }))
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Educación</div>
          <div className="e-section-subtitle">{list.length} entrada{list.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="e-btn e-btn-accent e-btn-sm" onClick={add}>+ Agregar</button>
      </div>

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">◇</div>
          <div className="e-empty-text">Sin educación cargada</div>
          <button className="e-btn e-btn-ghost e-btn-sm" onClick={add}>Agregar</button>
        </div>
      )}

      {list.map(edu => (
        <div className="e-card" key={edu.id}>
          <div className="e-card-header">
            <div>
              <div className="e-card-title">{edu.degree || 'Título'}</div>
              <div className="e-card-subtitle">{edu.school || 'Institución'}</div>
            </div>
            <button className="e-icon-btn danger" onClick={() => remove(edu.id)}>✕</button>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Título</label>
              <input className="e-input" placeholder="Lic. en Diseño Gráfico" value={edu.degree} onChange={e => update(edu.id, 'degree', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Institución</label>
              <input className="e-input" placeholder="UBA" value={edu.school} onChange={e => update(edu.id, 'school', e.target.value)} />
            </div>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Tipo</label>
              <select className="e-input e-select" value={edu.type || 'grado'} onChange={e => update(edu.id, 'type', e.target.value)}>
                {EDUCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="e-form-group">
              <label className="e-label">Estado</label>
              <select className="e-input e-select" value={edu.status || 'graduated'} onChange={e => update(edu.id, 'status', e.target.value)}>
                {EDUCATION_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Desde</label>
              <input className="e-input" placeholder="2018" value={edu.from} onChange={e => update(edu.id, 'from', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Hasta</label>
              <input className="e-input" placeholder="2022 / Presente" value={edu.to} onChange={e => update(edu.id, 'to', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
