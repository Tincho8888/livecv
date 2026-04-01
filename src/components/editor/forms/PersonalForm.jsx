import { WORK_PREFERENCES } from '../../../lib/cvDefaults'

export default function PersonalForm({ cvData, onChange, onAvatarUpload }) {
  const p = cvData.personal || {}

  function upP(key, val) {
    onChange(prev => ({ ...prev, personal: { ...prev.personal, [key]: val } }))
  }

  function togglePref(val) {
    const current = p.open_to || []
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
    upP('open_to', next)
  }

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Información Personal</div>
          <div className="e-section-subtitle">La base de tu CV</div>
        </div>
      </div>

      {/* Avatar */}
      <div className="e-form-group" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div
          style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}
          onClick={() => document.getElementById('avatar-input').click()}
          title="Subir foto"
          style={{ cursor: 'pointer', width: 72, height: 72, borderRadius: '50%', background: 'var(--bg3)', border: '2px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}
        >
          {p.avatarUrl
            ? <img src={p.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '◈'
          }
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Foto de perfil</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>JPG o PNG, máx. 2MB</div>
          <label className="e-btn e-btn-ghost e-btn-sm" style={{ cursor: 'pointer' }}>
            Subir foto
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => onAvatarUpload?.(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Preferencias de trabajo */}
      <div className="e-form-group" style={{ marginBottom: 24 }}>
        <label className="e-label">Disponibilidad</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {WORK_PREFERENCES.map(pref => {
            const active = (p.open_to || []).includes(pref.value)
            return (
              <button
                key={pref.value}
                className={`e-btn e-btn-sm ${active ? 'e-btn-accent' : 'e-btn-ghost'}`}
                onClick={() => togglePref(pref.value)}
                style={active ? {} : { opacity: 0.7 }}
              >
                {pref.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="e-form-row">
        <div className="e-form-group">
          <label className="e-label">Nombre completo</label>
          <input className="e-input" placeholder="Martín García" value={p.name || ''} onChange={e => upP('name', e.target.value)} />
        </div>
        <div className="e-form-group">
          <label className="e-label">Título profesional</label>
          <input className="e-input" placeholder="Senior Full-Stack Developer" value={p.title || ''} onChange={e => upP('title', e.target.value)} />
        </div>
      </div>

      <div className="e-form-row">
        <div className="e-form-group">
          <label className="e-label">Email</label>
          <input className="e-input" type="email" placeholder="martin@email.com" value={p.email || ''} onChange={e => upP('email', e.target.value)} />
        </div>
        <div className="e-form-group">
          <label className="e-label">Teléfono</label>
          <input className="e-input" placeholder="+54 11 0000-0000" value={p.phone || ''} onChange={e => upP('phone', e.target.value)} />
        </div>
      </div>

      <div className="e-form-row">
        <div className="e-form-group">
          <label className="e-label">Ubicación</label>
          <input className="e-input" placeholder="Buenos Aires, Argentina" value={p.location || ''} onChange={e => upP('location', e.target.value)} />
        </div>
        <div className="e-form-group">
          <label className="e-label">LinkedIn</label>
          <input className="e-input" placeholder="linkedin.com/in/martingarcia" value={p.linkedin || ''} onChange={e => upP('linkedin', e.target.value)} />
        </div>
      </div>

      <div className="e-form-row">
        <div className="e-form-group">
          <label className="e-label">GitHub</label>
          <input className="e-input" placeholder="github.com/martingarcia" value={p.github || ''} onChange={e => upP('github', e.target.value)} />
        </div>
        <div className="e-form-group">
          <label className="e-label">Sitio web / Portfolio</label>
          <input className="e-input" placeholder="martingarcia.dev" value={p.website || ''} onChange={e => upP('website', e.target.value)} />
        </div>
      </div>

    </>
  )
}