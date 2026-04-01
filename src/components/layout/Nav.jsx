import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Nav({
  session,
  screen,
  saveStatus,
  onLogoClick,
  onGoToDashboard,
  onShowAuth,
  onExportVisual,
  onExportAI,
  onShare,
  isPublic,
  onTogglePublic,
  currentCvId,
}) {
  const [showPdfNav, setShowPdfNav]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="nav" onClick={() => showPdfNav && setShowPdfNav(false)}>
      {/* Logo */}
      <div className="nav-logo" onClick={onLogoClick}>
        LIVE<span className="sub">CV</span>
      </div>

      {/* Save status — centered */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
        {screen === "editor" && (
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === "saving"  && <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1s infinite" }} />guardando...</>}
            {saveStatus === "saved"   && <><span className="live-dot" />guardado</>}
            {saveStatus === "unsaved" && <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", display: "inline-block" }} />sin guardar</>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="nav-actions">
        {screen === "editor" && (
          <>
            {/* PDF dropdown */}
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowPdfNav(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <path d="M9 13h1.5a1.2 1.2 0 010 2.4H9V13z"/><line x1="9" y1="17" x2="11.5" y2="17"/>
                </svg>
                PDF
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>

              {showPdfNav && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--bg2)", border: "1px solid var(--border-active)", borderRadius: 10, padding: "5px", minWidth: 210, boxShadow: "0 16px 48px rgba(0,0,0,0.4)", zIndex: 600 }}>
                  {[
                    {
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
                      label: "PDF Visual", sub: "Diseño · foto · colores",
                      fn: () => { setShowPdfNav(false); onExportVisual(); }
                    },
                    {
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13l1.5 4 1.5-4 1.5 4 1.5-4"/></svg>,
                      label: "PDF IA / ATS", sub: "Texto limpio · apto parsers",
                      fn: () => { setShowPdfNav(false); onExportAI(); }
                    },
                  ].map(({ icon, label, sub, fn }, i) => (
                    <button
                      key={i} onClick={fn}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {icon}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-body)" }}>{label}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Public toggle + Ver CV */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px 4px 12px" }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: isPublic ? "var(--green)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                {isPublic ? "● Público" : "○ Privado"}
              </span>
              <div
                onClick={() => currentCvId && onTogglePublic(!isPublic)}
                style={{
                  width: 32, height: 18, borderRadius: 9, flexShrink: 0,
                  background: isPublic ? "var(--green)" : "var(--bg3)",
                  border: `1px solid ${isPublic ? "var(--green)" : "var(--border-active)"}`,
                  cursor: currentCvId ? "pointer" : "not-allowed",
                  position: "relative", transition: "all 0.2s", opacity: currentCvId ? 1 : 0.4,
                }}
              >
                <div style={{
                  position: "absolute", top: 2, left: isPublic ? 13 : 2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: isPublic ? "#fff" : "var(--text-muted)",
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onShare} disabled={!currentCvId} style={{ opacity: currentCvId ? 1 : 0.4 }}>
              Ver CV →
            </button>
          </>
        )}

        {session ? (
          <div style={{ position: "relative" }}>
            <div className="user-avatar" onClick={() => setShowUserMenu(p => !p)}>
              {session.user.user_metadata?.avatar_url
                ? <img src={session.user.user_metadata.avatar_url} alt="" />
                : (session.user.user_metadata?.full_name?.[0] || session.user.email?.[0] || "U").toUpperCase()
              }
            </div>
            {showUserMenu && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowUserMenu(false)} />
                <UserMenu
                  session={session}
                  onGoToDashboard={onGoToDashboard}
                  onClose={() => setShowUserMenu(false)}
                />
              </>
            )}
          </div>
        ) : (
          <button className="btn btn-accent btn-sm" onClick={onShowAuth}>
            Iniciar sesión
          </button>
        )}
      </div>
    </nav>
  );
}