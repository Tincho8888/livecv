import { newLanguage, LANGUAGE_LEVELS } from '../../../lib/cvDefaults'

export default function LanguagesForm({ cvData, onChange }) {
  const list = cvData.languages || []

  function add() {
    onChange(prev => ({ ...prev, languages: [...(prev.languages || []), newLanguage()] }))
  }

  function update(id, key, val) {
    onChange(prev => ({
      ...prev,
      languages: prev.languages.map(l => l.id === id ? { ...l, [key]: val } : l)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }))
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Idiomas</div>
          <div className="e-section-subtitle">{list.length} idioma{list.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="e-btn e-btn-accent e-btn-sm" onClick={add}>+ Agregar</button>
      </div>

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">◐</div>
          <div className="e-empty-text">Español, Inglés, Portugués...</div>
          <button className="e-btn e-btn-ghost e-btn-sm" onClick={add}>Agregar idioma</button>
        </div>
      )}

      {list.map(lang => (
        <div className="e-card" key={lang.id}>
          <div className="e-card-header">
            <div className="e-card-title">{lang.name || 'Idioma'}</div>
            <button className="e-icon-btn danger" onClick={() => remove(lang.id)}>✕</button>
          </div>
          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Idioma</label>
              <input className="e-input" placeholder="Inglés" value={lang.name} onChange={e => update(lang.id, 'name', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Nivel</label>
              <select className="e-input e-select" value={lang.level} onChange={e => update(lang.id, 'level', e.target.value)}>
                {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
