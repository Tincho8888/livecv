import { useState } from 'react'
import { newSkill, SKILL_CATEGORIES } from '../../../lib/cvDefaults'

export default function SkillsForm({ cvData, onChange }) {
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('tool')
  const list = cvData.skills || []

  function add() {
    const name = input.trim()
    if (!name) return
    onChange(prev => ({ ...prev, skills: [...prev.skills, { ...newSkill(), name, category }] }))
    setInput('')
  }

  function setLevel(id, level) {
    onChange(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, level } : s)
    }))
  }

  function remove(id) {
    onChange(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }))
  }

  const grouped = SKILL_CATEGORIES
    .map(cat => ({ ...cat, items: list.filter(s => s.category === cat.value) }))
    .filter(g => g.items.length > 0)

  return (
    <>
      <div className="e-section-header">
        <div>
          <div className="e-section-title">Skills</div>
          <div className="e-section-subtitle">{list.length} habilidades</div>
        </div>
      </div>

      {/* Agregar skill */}
      <div className="e-form-group">
        <label className="e-label">Agregar skill</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="e-input e-select" style={{ width: 160, flexShrink: 0 }} value={category} onChange={e => setCategory(e.target.value)}>
            {SKILL_CATEGORIES.filter(c => c.value !== 'soft').map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            className="e-input"
            placeholder="React, TypeScript, Figma..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button className="e-btn e-btn-accent e-btn-sm" onClick={add} style={{ flexShrink: 0 }}>+</button>
        </div>
      </div>

      {/* Skills agrupados */}
      {grouped.map(group => (
        <div key={group.value} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            {group.label}
          </div>
          {group.items.map(skill => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ flex: 1, fontSize: 13 }}>{skill.name}</span>
              {/* Nivel (dots) */}
              <div className="e-skill-level">
                {[1,2,3,4,5].map(n => (
                  <div
                    key={n}
                    className={`e-skill-dot ${skill.level >= n ? 'filled' : ''}`}
                    onClick={() => setLevel(skill.id, n)}
                    title={`Nivel ${n}`}
                  />
                ))}
              </div>
              <button className="e-icon-btn danger" onClick={() => remove(skill.id)} style={{ flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
      ))}

      {list.length === 0 && (
        <div className="e-empty">
          <div className="e-empty-icon">◈</div>
          <div className="e-empty-text">Agregá tus tecnologías y herramientas</div>
        </div>
      )}
    </>
  )
}
