import { newExperience } from '../../../lib/cvDefaults'

export default function ExperienceForm({ cvData, onChange }) {
  const list = cvData.experience || []

  function add() {
    onChange(prev => ({ ...prev, experience: [...prev.experience, newExperience()] }))
  }

  function update(id, key, val) {
    onChange(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [key]: val } : e)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }))
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Experiencia</div>
          <div className="e-section-subtitle">{list.length} entrada{list.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="e-btn e-btn-accent e-btn-sm" onClick={add}>+ Agregar</button>
      </div>

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">◆</div>
          <div className="e-empty-text">Sin experiencia todavía</div>
          <button className="e-btn e-btn-ghost e-btn-sm" onClick={add}>Agregar primera entrada</button>
        </div>
      )}

      {list.map(exp => (
        <div className="e-card" key={exp.id}>
          <div className="e-card-header">
            <div>
              <div className="e-card-title">{exp.role || 'Nuevo rol'}</div>
              <div className="e-card-subtitle">{exp.company || 'Empresa'}</div>
            </div>
            <button className="e-icon-btn danger" onClick={() => remove(exp.id)}>✕</button>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Cargo</label>
              <input className="e-input" placeholder="Product Designer" value={exp.role} onChange={e => update(exp.id, 'role', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Empresa</label>
              <input className="e-input" placeholder="Mercado Libre" value={exp.company} onChange={e => update(exp.id, 'company', e.target.value)} />
            </div>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Desde</label>
              <input className="e-input" placeholder="Ene 2022" value={exp.from} onChange={e => update(exp.id, 'from', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Hasta</label>
              <input className="e-input" placeholder="Presente" disabled={exp.current} value={exp.current ? 'Presente' : exp.to} onChange={e => update(exp.id, 'to', e.target.value)} />
            </div>
          </div>

          <div className="e-form-group">
            <label className="e-checkbox-row">
              <input type="checkbox" checked={exp.current} onChange={e => update(exp.id, 'current', e.target.checked)} />
              Trabajo actual
            </label>
          </div>

          <div className="e-form-group">
            <label className="e-label">Descripción</label>
            <textarea className="e-input e-textarea" placeholder="Lideré el rediseño del checkout aumentando conversión un 23%..." value={exp.desc} onChange={e => update(exp.id, 'desc', e.target.value)} />
          </div>
        </div>
      ))}
    </>
  )
}
