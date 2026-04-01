import { newPortfolioLink } from '../../../lib/cvDefaults'

const PLATFORMS = [
  { value: 'behance',  label: 'Behance',  color: '#1769ff' },
  { value: 'dribbble', label: 'Dribbble', color: '#ea4c89' },
  { value: 'github',   label: 'GitHub',   color: '#f0ede8' },
  { value: 'figma',    label: 'Figma',    color: '#a259ff' },
  { value: 'other',    label: 'Otro',     color: '#6b6a72' },
]

export default function PortfolioForm({ cvData, onChange }) {
  const list = cvData.portfolio || []

  function add() {
    onChange(prev => ({ ...prev, portfolio: [...(prev.portfolio || []), newPortfolioLink()] }))
  }

  function update(id, key, val) {
    onChange(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(p => p.id === id ? { ...p, [key]: val } : p)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== id) }))
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Portfolio</div>
          <div className="e-section-subtitle">Visible solo si agregás al menos un link</div>
        </div>
        <button className="e-btn e-btn-accent e-btn-sm" onClick={add}>+ Agregar</button>
      </div>

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">◑</div>
          <div className="e-empty-text">Behance, Dribbble, GitHub, Figma...</div>
          <button className="e-btn e-btn-ghost e-btn-sm" onClick={add}>Agregar link</button>
        </div>
      )}

      {list.map(item => (
        <div className="e-card" key={item.id}>
          <div className="e-card-header">
            <div className="e-card-title">{item.label || item.platform || 'Link'}</div>
            <button className="e-icon-btn danger" onClick={() => remove(item.id)}>✕</button>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Plataforma</label>
              <select className="e-input e-select" value={item.platform} onChange={e => update(item.id, 'platform', e.target.value)}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="e-form-group">
              <label className="e-label">Etiqueta (opcional)</label>
              <input className="e-input" placeholder="Mi portfolio" value={item.label} onChange={e => update(item.id, 'label', e.target.value)} />
            </div>
          </div>

          <div className="e-form-group">
            <label className="e-label">URL</label>
            <input className="e-input" placeholder="https://behance.net/..." value={item.url} onChange={e => update(item.id, 'url', e.target.value)} />
          </div>
        </div>
      ))}
    </>
  )
}
