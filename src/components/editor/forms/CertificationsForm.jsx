import { newCertification } from '../../../lib/cvDefaults'

export default function CertificationsForm({ cvData, onChange }) {
  const list = cvData.certifications || []

  function add() {
    onChange(prev => ({ ...prev, certifications: [...(prev.certifications || []), newCertification()] }))
  }

  function update(id, key, val) {
    onChange(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [key]: val } : c)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }))
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Certificaciones</div>
          <div className="e-section-subtitle">{list.length} certificación{list.length !== 1 ? 'es' : ''}</div>
        </div>
        <button className="e-btn e-btn-accent e-btn-sm" onClick={add}>+ Agregar</button>
      </div>

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">✦</div>
          <div className="e-empty-text">AWS, Google, Coursera, LinkedIn Learning...</div>
          <button className="e-btn e-btn-ghost e-btn-sm" onClick={add}>Agregar certificación</button>
        </div>
      )}

      {list.map(cert => (
        <div className="e-card" key={cert.id}>
          <div className="e-card-header">
            <div>
              <div className="e-card-title">{cert.name || 'Nueva certificación'}</div>
              <div className="e-card-subtitle">{cert.issuer || 'Emisor'}</div>
            </div>
            <button className="e-icon-btn danger" onClick={() => remove(cert.id)}>✕</button>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Nombre</label>
              <input className="e-input" placeholder="AWS Solutions Architect" value={cert.name} onChange={e => update(cert.id, 'name', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">Emisor</label>
              <input className="e-input" placeholder="Amazon Web Services" value={cert.issuer} onChange={e => update(cert.id, 'issuer', e.target.value)} />
            </div>
          </div>

          <div className="e-form-row">
            <div className="e-form-group">
              <label className="e-label">Fecha</label>
              <input className="e-input" placeholder="Mar 2024" value={cert.date} onChange={e => update(cert.id, 'date', e.target.value)} />
            </div>
            <div className="e-form-group">
              <label className="e-label">URL / Credencial</label>
              <input className="e-input" placeholder="https://..." value={cert.url} onChange={e => update(cert.id, 'url', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
