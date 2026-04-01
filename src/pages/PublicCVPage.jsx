import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { callClaude } from "../services/aiService";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

function getThemeVars(dark, exportMode) {
  if (exportMode) return `
    --bg: #ffffff; --bg2: #ffffff; --bg3: #f5f5f5;
    --border: rgba(0,0,0,0.1); --border2: rgba(0,0,0,0.15);
    --ink: #111111; --ink2: #333333; --ink3: #666666; --ink4: #999999;
    --accent: #c4b5fd; --accent-b: rgba(196,181,253,0.15); --accent-s: rgba(196,181,253,0.3);
    --green: #c4b5fd; --green-b: rgba(196,181,253,0.15);
    --card: #ffffff; --card2: #ffffff;
    --shadow: none; --shadow-lg: none;
    --cta-bg: #111111; --cta-text: #ffffff;
  `;
  if (dark) return `
    --bg: #0a0a0b; --bg2: #111113; --bg3: #18181c;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --ink: #f0ede8; --ink2: #c8c5be; --ink3: #8a8892; --ink4: #4e4d57;
    --accent: #c4b5fd; --accent-b: rgba(196,181,253,0.15); --accent-s: rgba(196,181,253,0.3);
    --green: #c4b5fd; --green-b: rgba(196,181,253,0.15);
    --card: #111113; --card2: #16161a;
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.5);
    --cta-bg: #270979; --cta-text: #0a0a0b;
  
  /* skill tags dark override */
  .skill-tag-expert       { color: var(--accent) !important; background: var(--accent-b) !important; border-color: var(--accent-s) !important; }
  .skill-tag-advanced     { color: #8b5cf6 !important; background: rgba(139,92,246,0.1) !important; border-color: rgba(139,92,246,0.25) !important; }
  .skill-tag-intermediate { color: #a78bfa !important; background: rgba(167,139,250,0.08) !important; border-color: rgba(167,139,250,0.2) !important; }
  .skill-tag-beginner     { color: #6a6a72 !important; background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.08) !important; }
  `;
  return `
    --bg: #f7f5f0; --bg2: #efede8; --bg3: #e5e2da;
    --border: rgba(0,0,0,0.08); --border2: rgba(0,0,0,0.14);
    --ink: #1a1a18; --ink2: #3d3b35; --ink3: #7a7870; --ink4: #b0ada5;
    --accent: #270979; --accent-b: rgba(39,9,121,0.08); --accent-s: rgba(39,9,121,0.2);
    --green: #270979; --green-b: rgba(39,9,121,0.1);
    --card: #ffffff; --card2: #f7f5f0;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    --cta-bg: #1a1a18; --cta-text: #f7f5f0;
  `;
}

const css = (dark, exportMode) => `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  :root { ${getThemeVars(dark, exportMode)} --font-d: 'Playfair Display', serif; --font-b: 'DM Sans', sans-serif; --font-m: 'DM Mono', monospace; }
  body { background: var(--bg); color: var(--ink); font-family: var(--font-b); min-height: 100vh; -webkit-font-smoothing: antialiased; transition: background 0.3s, color 0.3s; }

  /* TOPBAR */
  .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; transition: all 0.25s; }
  .topbar.scrolled { background: ${dark ? "rgba(10,10,11,0.92)" : "rgba(247,245,240,0.92)"}; backdrop-filter: blur(24px); border-bottom: 1px solid var(--border); box-shadow: 0 1px 12px rgba(0,0,0,${dark ? "0.3" : "0.06"}); }
  .topbar-brand { font-family: 'Inter', sans-serif; font-weight: 900; font-size: 22px; text-decoration: none; letter-spacing: -0.5px; line-height: 1; color: ${dark ? "#fff" : "#000"}; display: flex; flex-direction: column; }
  .topbar-brand .sub { font-weight: 300; font-size: 9px; letter-spacing: 0px; opacity: ${dark ? "0.8" : "0.85"}; margin-top: -1px; color: ${dark ? "#fff" : "#555"}; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .topbar-slug { font-size: 11px; font-family: var(--font-m); color: var(--ink4); }

  /* THEME TOGGLE */
  .theme-toggle { width: 36px; height: 36px; 4px; border: 1px solid var(--border2); background: var(--bg3); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--accent); transition: all 0.2s; }

  /* BUTTONS */
  .btn { font-family: var(--font-b); font-size: 13px; font-weight: 500; padding: 8px 18px; 3px; border: none; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
  .btn-outline { background: transparent; color: var(--ink2); border: 1px solid var(--border2); }
  .btn-outline:hover { background: var(--bg2); }
  .btn-accent { background: var(--accent); color: ${dark ? "#0a0a0b" : "#fff"}; font-weight: 600; }
  .btn-accent:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px var(--accent-s); }
  .btn-sm { padding: 6px 13px; font-size: 12px; 3px; }

  /* LAYOUT */
  .page { max-width: 1100px; margin: 0 auto; padding: 72px 48px 80px; }

  /* HEADER CARD */
  .header-card { background: var(--card); border: 1px solid var(--border2); border-radius: 6px; padding: 44px 56px; box-shadow: var(--shadow); margin-bottom: 12px; display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: start; opacity: 0; animation: fadeUp 0.55s ease 0.05s forwards; }
  .header-badges { display: none; }
  .badge-dot { display: none; }  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-family: var(--font-m); font-weight: 500; padding: 4px 10px; 14px; letter-spacing: 0.5px; }
  .badge-ai { background: var(--accent-b); color: var(--accent); border: 1px solid var(--accent-s); }
  .badge-available { background: var(--green-b); color: var(--green); border: 1px solid ${dark ? "rgba(76,175,125,0.2)" : "rgba(45,122,85,0.2)"}; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
  .header-name { font-family: var(--font-d); font-size: clamp(38px, 5vw, 62px); font-weight: 700; line-height: 1; letter-spacing: -2px; color: var(--ink); margin-bottom: 14px; }
  .header-title { font-size: 12px; color: var(--accent); font-weight: 700; 10px; font-family: var(--font-m); letter-spacing: 3px; text-transform: uppercase; }
  .header-summary { font-size: 15.5px; color: var(--ink2); line-height: 1.65; margin-bottom: 18px; font-weight: 400; opacity: 0.85; }
  .summary-expand-btn { display: none; }
  .header-contacts { display: flex; flex-wrap: wrap; gap: 8px; }
  .contact-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-family: var(--font-m); color: var(--ink); background: var(--bg2); border: 1px solid var(--border2); padding: 5px 11px; border-radius: 8px; text-decoration: none; transition: all 0.15s; font-weight: 500; }
  .contact-chip:hover { background: var(--bg3); color: var(--ink); border-color: var(--ink4); }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
  .avatar { width: 180px; height: 180px; border-radius: 50%; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-family: var(--font-d); font-size: 56px; font-weight: 700; color: var(--accent); flex-shrink: 0; overflow: hidden; box-shadow: 0 0 0 3px var(--card), 0 0 0 5px var(--border); }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }

  /* METRICS */
  .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; 12px; opacity: 0; animation: fadeUp 0.55s ease 0.1s forwards; }
  .metric { background: var(--card); border: 1px solid var(--border); 6px; padding: 20px; text-align: center; box-shadow: var(--shadow); }
  .metric-value { font-family: var(--font-d); font-size: 32px; font-weight: 700; color: var(--accent); line-height: 1; margin-bottom: 4px; }
  .metric-label { font-size: 11px; color: var(--ink3); font-family: var(--font-m); letter-spacing: 1px; text-transform: uppercase; }

  /* MAIN GRID */
  .main-grid { display: grid; grid-template-columns: 1fr 280px; gap: 12px; align-items: start; }

  /* CARDS */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 22px 18px; box-shadow: var(--shadow); margin-bottom: 12px; opacity: 0; animation: fadeUp 0.55s ease forwards; }
  .card-title { font-size: 13px; font-family: var(--font-b); font-weight: 600; color: var(--ink); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
  .card-title::after { content: ''; flex: 1; height: 1px; background: var(--border2); }

  /* SUMMARY */
  .summary-text { font-family: var(--font-b); font-size: 20px; font-weight: 400; line-height: 1.75; color: var(--ink); }

  /* TIMELINE */
  .timeline { display: flex; flex-direction: column; }
  .timeline-item { display: grid; grid-template-columns: 72px 1fr; gap: 0 20px; padding: 14px 0; border-bottom: 1px solid var(--border); position: relative; }
  .timeline-item:last-child { border-bottom: none; padding-bottom: 0; }
  .timeline-date { font-size: 13px; font-family: var(--font-m); color: var(--ink2); text-align: right; line-height: 1.8; font-weight: 500; padding-top: 4px; }
  .timeline-current { display: inline-block; font-size: 11px; color: var(--ink2); font-family: var(--font-m); font-weight: 600; margin-bottom: 2px; }
  .timeline-body { padding-left: 10px; }
  .timeline-role { font-family: var(--font-d); font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 6px; line-height: 1.2; }
  .timeline-company { font-size: 13px; color: var(--ink2); font-family: var(--font-b); font-weight: 700; 8px; }
  .timeline-desc { font-size: 16px; color: var(--ink); line-height: 1.8; opacity: 0.9; }
  .timeline-desc ul { padding-left: 16px; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .timeline-desc li { line-height: 1.8; }

  /* EDUCATION */
  .edu-list { display: flex; flex-direction: column; gap: 12px; }
  .edu-item { display: flex; gap: 10px; align-items: flex-start; }
  .edu-item.edu-secondary { opacity: 0.75; }
  .edu-icon { width: 26px; height: 26px; border-radius: 6px; background: var(--bg2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; color: var(--ink3); flex-shrink: 0; }
  .edu-degree { font-family: var(--font-b); font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .edu-tag { font-size: 9px; font-family: var(--font-b); font-weight: 600; padding: 1px 6px; border-radius: 6px; flex-shrink: 0; }
  .edu-tag-ongoing  { background: var(--accent-b); color: var(--accent); border: 1px solid var(--accent-s); }
  .edu-tag-graduated { background: var(--accent-b); color: var(--accent); border: 1px solid var(--accent-s); }
  .edu-school { font-size: 11px; color: var(--ink3); font-family: var(--font-b); }
  .edu-year { font-size: 11px; color: var(--ink4); margin-top: 2px; font-family: var(--font-b); }
  .edu-divider { height: 1px; background: var(--border); margin: 4px 0 8px; }

  /* PORTFOLIO */
  .portfolio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .portfolio-card { border-radius: 6px; overflow: hidden; border: 1px solid var(--border); background: var(--card); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
  .portfolio-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .portfolio-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; background: var(--bg3); }
  .portfolio-info { padding: 12px 14px; }
  .portfolio-title { font-family: var(--font-b); font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 5px; }
  .portfolio-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 5px; }
  .portfolio-tag { font-size: 10px; font-family: var(--font-b); color: var(--ink4); background: var(--bg3); border: 1px solid var(--border); padding: 1px 7px; 14px; }
  .portfolio-desc { font-size: 11px; color: var(--ink3); font-family: var(--font-b); line-height: 1.5; }
  .portfolio-link { font-size: 11px; color: var(--accent); font-family: var(--font-b); margin-top: 6px; display: inline-block; opacity: 0.85; }
  .projects-list { display: flex; flex-direction: column; gap: 12px; }
  .project-item { padding: 16px 18px; background: var(--bg2); border: 1px solid var(--border); 4px; transition: all 0.15s; }
  .project-item:hover { background: var(--bg3); border-color: var(--border2); }
  .project-name { font-family: var(--font-d); font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .project-url { font-size: 11px; font-family: var(--font-m); color: var(--accent); margin-bottom: 6px; }
  .project-desc { font-size: 13px; color: var(--ink3); line-height: 1.65; }

  /* SIDEBAR */
  .sidebar-card { background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 20px 22px; box-shadow: var(--shadow); margin-bottom: 8px; opacity: 0; animation: fadeUp 0.55s ease forwards; }
  .sidebar-card-title { font-size: 13px; font-family: var(--font-b); font-weight: 600; color: var(--ink); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .sidebar-card-title::after { content: ''; flex: 1; height: 1px; background: var(--border2); }

  /* SKILLS */
  .skills-wrap { display: flex; flex-direction: column; gap: 6px; }
  .skill-row { display: flex; flex-direction: column; gap: 5px; }
  .skill-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .skill-name { font-size: 13px; font-family: var(--font-b); color: var(--ink); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .skill-tag { font-size: 10px; font-family: var(--font-b); font-weight: 700; flex-shrink: 0; padding: 2px 8px; border-radius: 6px; }
  .skill-tag-expert       { color: var(--accent); background: var(--accent-b); border: 1px solid var(--accent-s); }
  .skill-tag-advanced     { color: #6d28d9; background: #ede9fe; border: 1px solid #c4b5fd; }
  .skill-tag-intermediate { color: #7c3aed; background: #f3f0ff; border: 1px solid #ddd6fe; }
  .skill-tag-beginner     { color: #555; background: #f0f0f0; border: 1px solid #ddd; }
  .skill-bar-track { display: none; }
  .skill-bar-fill  { display: none; }

  /* Sidebar hierarchy */
  .sidebar-card:first-of-type { border-color: var(--border2); }
  .sidebar-card-title { font-size: 11px; font-family: var(--font-b); font-weight: 700; color: var(--ink2); letter-spacing: 1.5px; text-transform: uppercase; 10px; display: flex; align-items: center; gap: 10px; }
  .sidebar-card-title::after { content: ''; flex: 1; height: 1px; background: var(--border2); }

  /* CERTS */
  .cert-list { display: flex; flex-direction: column; gap: 12px; }
  .cert-item { display: flex; gap: 10px; align-items: flex-start; }
  .cert-icon { width: 26px; height: 26px; border-radius: 6px; background: var(--bg2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; color: var(--ink3); flex-shrink: 0; margin-top: 1px; }
  .cert-icon-soft { width: 26px; height: 26px; border-radius: 6px; background: var(--bg2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; color: var(--ink3); flex-shrink: 0; margin-top: 1px; }
  .cert-name { font-family: var(--font-b); font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.4; }
  .cert-name-soft { font-family: var(--font-b); font-size: 13px; font-weight: 500; color: var(--ink2); line-height: 1.4; }
  .cert-sep { display: none; }
  .cert-meta { font-size: 11px; color: var(--ink4); font-family: var(--font-b); margin-top: 2px; }
  .cert-link { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; color: #4a7fc1; font-family: var(--font-m); text-decoration: none; margin-top: 4px; opacity: 0.85; border: 1px solid rgba(100,149,212,0.35); padding: 2px 7px; 2px; background: rgba(100,149,212,0.08); letter-spacing: 0.3px; }
  .cert-link:hover { opacity: 1; background: rgba(100,149,212,0.15); }
  .lang-list { display: flex; flex-direction: column; gap: 10px; }
  .lang-item { display: flex; align-items: center; justify-content: space-between; }
  .lang-name { font-size: 13px; font-weight: 500; color: var(--ink); font-family: var(--font-b); }
  .lang-level { font-size: 10px; font-family: var(--font-b); color: var(--ink4); background: var(--bg2); padding: 2px 8px; 2px; border: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.3px; }

  /* AI CARD */
  .ai-card { background: ${dark ? "linear-gradient(135deg, rgba(39,9,121,0.07), rgba(10,10,11,0))" : "linear-gradient(135deg, rgba(39,9,121,0.06), rgba(247,245,240,0))"}; border: 1px solid var(--accent-s); 8px; padding: 20px; 10px; opacity: 0; animation: fadeUp 0.55s ease 0.2s forwards; }
  .ai-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .ai-card-icon { width: 26px; height: 26px; 2px; background: var(--accent); display: flex; align-items: center; justify-content: center; color: ${dark ? "#0a0a0b" : "#fff"}; font-size: 11px; flex-shrink: 0; }
  .ai-card-title { font-size: 11px; font-weight: 600; color: var(--accent); font-family: var(--font-m); letter-spacing: 0.5px; }
  .ai-card-body { font-size: 12px; color: var(--ink3); line-height: 1.6; }

  /* CTA CARD */
  .cta-card { background: var(--cta-bg); 8px; padding: 24px; text-align: center; 10px; opacity: 0; animation: fadeUp 0.55s ease 0.1s forwards; }
  .cta-card-title { font-family: var(--font-d); font-size: 19px; color: var(--cta-text); margin-bottom: 6px; font-weight: 700; }
  .cta-card-sub { font-size: 12px; color: ${dark ? "rgba(10,10,11,0.55)" : "rgba(247,245,240,0.6)"}; 12px; line-height: 1.5; }
  .btn-cta { background: ${dark ? "rgba(10,10,11,0.15)" : "rgba(247,245,240,0.15)"}; color: var(--cta-text); border: 1px solid ${dark ? "rgba(10,10,11,0.2)" : "rgba(247,245,240,0.3)"}; font-weight: 600; width: 100%; justify-content: center; padding: 11px; 3px; font-family: var(--font-b); font-size: 13px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
  .btn-cta:hover { background: ${dark ? "rgba(10,10,11,0.25)" : "rgba(247,245,240,0.25)"}; transform: translateY(-1px); }

  /* CONTACT MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,${dark ? "0.8" : "0.5"}); z-index: 400; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); animation: fadeIn 0.2s ease; }
  .modal-box { background: var(--card); border: 1px solid var(--border2); 12px; padding: 36px; max-width: 440px; width: 90%; animation: fadeUp 0.2s ease; box-shadow: var(--shadow-lg); }
  .modal-title { font-family: var(--font-d); font-size: 26px; font-weight: 700; margin-bottom: 6px; color: var(--ink); }
  .modal-sub { font-size: 13px; color: var(--ink3); margin-bottom: 24px; line-height: 1.6; }
  .field-label { font-size: 10px; font-family: var(--font-m); color: var(--ink3); display: block; margin-bottom: 6px; letter-spacing: 1px; text-transform: uppercase; }
  .field-input { width: 100%; background: var(--bg2); border: 1px solid var(--border2); color: var(--ink); font-family: var(--font-b); font-size: 14px; padding: 10px 12px; 3px; outline: none; margin-bottom: 14px; transition: all 0.15s; }
  .field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-b); }
  .field-input::placeholder { color: var(--ink4); }

  /* FOOTER */
  .footer { border-top: 1px solid var(--border); padding: 28px 48px; max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-start; justify-content: space-between; }
  .footer-brand { font-family: var(--font-d); font-size: 16px; font-weight: 700; color: var(--accent); }
  .footer-brand span { color: var(--ink4); font-style: italic; font-weight: 400; }
  .footer-text { font-size: 11px; font-family: var(--font-m); color: var(--ink3); }
  .footer-cta { font-size: 12px; color: var(--ink3); font-family: var(--font-m); text-decoration: none; }
  .footer-cta:hover { text-decoration: underline; }

  /* CENTER */
  .center-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: var(--bg); }
  .spinner { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border2); border-top-color: var(--accent); animation: spin 0.7s linear infinite; }

  /* ANIMATIONS */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); 4px; }

  /* MOBILE */
  @media (max-width: 768px) {
    .page { padding: 70px 16px 48px; }
    .header-card { grid-template-columns: 1fr; padding: 24px; gap: 16px; }
    .header-right { flex-direction: row; align-items: center; }
    .main-grid { grid-template-columns: 1fr; }
    .topbar { padding: 0 16px; }
    .topbar-slug { display: none; }
    .footer { padding: 20px 16px; flex-direction: column; gap: 10px; text-align: center; }
  }

  @media print {
    :root { --bg: #fff !important; --bg2: #f9f9f9 !important; --bg3: #f0f0f0 !important; --card: #fff !important; --card2: #fff !important; --ink: #111 !important; --ink2: #222 !important; --ink3: #444 !important; --ink4: #666 !important; --border: #e0e0e0 !important; --border2: #d0d0d0 !important; --accent: #270979 !important; --accent-b: rgba(39,9,121,0.06) !important; --accent-s: rgba(39,9,121,0.15) !important; --shadow: none !important; --shadow-lg: none !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff !important; color: #111 !important; }
    .topbar, .footer, .summary-expand-btn, .header-badges, .print-modal-overlay, .theme-toggle { display: none !important; }
    .page { padding: 24px 36px !important; max-width: 100% !important; margin: 0 !important; background: #fff !important; }
    .card, .sidebar-card { border: 1px solid #e0e0e0 !important; 3px !important; box-shadow: none !important; background: #fff !important; break-inside: avoid; }
    .main-grid { grid-template-columns: 1fr 220px !important; gap: 24px !important; }
    .header-card { background: #fff !important; border: 1px solid #e0e0e0 !important; box-shadow: none !important; }
    .header-name { font-size: 42px !important; color: #111 !important; }
    .contact-chip { background: #f5f5f5 !important; color: #333 !important; border-color: #ddd !important; }
    .header-summary { max-height: none !important; overflow: visible !important; display: block !important; color: #444 !important; -webkit-line-clamp: unset !important; }
    .timeline-role { color: #111 !important; }
    .timeline-company { color: #555 !important; }
    .card-title, .sidebar-card-title { color: #888 !important; }
    .skill-bar-track { background: #eee !important; }
    .avatar { margin: 0 auto !important; display: block !important; }
    .avatar img { width: 80px !important; height: 80px !important; border-radius: 50% !important; }
    .header-right { display: flex !important; flex-direction: column !important; align-items: center !important; }
    .ai-card, .cta-card { display: none !important; }
    .metric { background: #fff !important; box-shadow: none !important; border: 1px solid #e0e0e0 !important; }
    .project-item { background: #fff !important; border: 1px solid #e0e0e0 !important; }
    .lang-level { background: #f5f5f5 !important; border-color: #ddd !important; }
    a { color: #333 !important; text-decoration: none !important; }
  }
`;

function ContactModal({ cv, dark, onClose }) {
  const [sent, setSent] = useState(false);
  const [from, setFrom] = useState("");
  const [company, setCompany] = useState("");
  const [msg, setMsg] = useState("");
  const name = cv?.data?.personal?.name || "";
  const firstName = name.split(" ")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {!sent ? <>
          <div className="modal-title">Contactar a {firstName}</div>
          <div className="modal-sub">Tu mensaje llega a <span style={{ color: "var(--accent)", fontFamily: "var(--font-m)", fontSize: 12 }}>{cv?.data?.personal?.email}</span></div>
          <label className="field-label">Tu email *</label>
          <input className="field-input" placeholder="recruiter@empresa.com" value={from} onChange={e => setFrom(e.target.value)} />
          <label className="field-label">Empresa</label>
          <input className="field-input" placeholder="Nombre de tu empresa" value={company} onChange={e => setCompany(e.target.value)} />
          <label className="field-label">Mensaje *</label>
          <textarea className="field-input" rows={4} placeholder={`Hola ${firstName}, me comunico porque...`} value={msg} onChange={e => setMsg(e.target.value)} style={{ resize: "vertical" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-accent" style={{ flex: 2 }} onClick={() => from.trim() && msg.trim() && setSent(true)}>
              Enviar mensaje →
            </button>
          </div>
        </> : <>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--green-b)", border: "1px solid var(--green)", opacity: 0.4, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: "var(--green)", opacity: 1 }}>✓</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 24, marginBottom: 8, fontWeight: 700 }}>Mensaje enviado</div>
            <div style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.6, marginBottom: 24 }}>{firstName} recibirá tu mensaje. Generalmente responde en 24–48hs.</div>
            <button className="btn btn-outline" style={{ width: "100%" }} onClick={onClose}>Cerrar</button>
          </div>
        </>}
      </div>
    </div>
  );
}

export default function PublicCV() {
  const { id: cvId } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [dark, setDark] = useState(true); // will be set after cv loads
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [lang, setLang] = useState("es");
  const [printModal, setPrintModal] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState(null);

  const calcDuration = (from, to, current, langKey) => {
    const monthMap = {
      enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11,
      january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11
    };
    const parse = (s) => {
      if (!s) return null;
      const parts = s.toLowerCase().trim().split(/\s+/);
      const year = parseInt(parts.find(p => /^\d{4}$/.test(p)));
      const month = monthMap[parts.find(p => monthMap[p] !== undefined)] ?? 0;
      if (!year) return null;
      return new Date(year, month, 1);
    };
    const start = parse(from);
    const end = current ? new Date() : parse(to);
    if (!start || !end) return null;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 1) return null;
    const y = Math.floor(months / 12);
    const m = months % 12;
    const es = langKey === "es";
    if (y > 0 && m > 0) return `${y} ${es ? (y===1?"año":"años") : (y===1?"year":"years")} ${m} ${es ? (m===1?"mes":"meses") : (m===1?"month":"months")}`;
    if (y > 0) return `${y} ${es ? (y===1?"año":"años") : (y===1?"year":"years")}`;
    return `${m} ${es ? (m===1?"mes":"meses") : (m===1?"month":"months")}`;
  };

  const t = useMemo(() => {
    const translations = {
      es: {
        available: "Disponible", experience: "Experiencia", education: "Educación",
        skills: "Skills", certifications: "Certificaciones", training: "Perfeccionamiento", languages: "Idiomas",
        present: "Actual", summary_more: "▼ Ver resumen completo", summary_less: "▲ Ver menos",
        updated: "Actualizado", years_exp: "años exp.", hecho: "HECHO CON", por: "POR",
        projects: "Proyectos", portfolio: "Portfolio",
        cta: "CREÁ TU PERFIL GRATIS →", loading: "Cargando perfil...", not_found: "Perfil no encontrado",
        not_found_sub: "Este link no existe o fue eliminado", back: "← Volver"
      },
      en: {
        available: "Available", experience: "Experience", education: "Education",
        skills: "Skills", certifications: "Certifications", training: "Training", languages: "Languages",
        present: "Present", summary_more: "▼ Read full summary", summary_less: "▲ Show less",
        updated: "Updated", years_exp: "yrs exp.", hecho: "MADE WITH", por: "BY",
        projects: "Projects", portfolio: "Portfolio",
        cta: "CREATE YOUR PROFILE FREE →", loading: "Loading profile...", not_found: "Profile not found",
        not_found_sub: "This link doesn't exist or was deleted", back: "← Go back"
      }
    };
    return translations[lang] ?? translations.es;
  }, [lang]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const translateCV = async (cvData) => {
    setTranslating(true);
    try {
      const payload = {
        title: cvData.personal?.title,
        summary: cvData.summary,
        experience: (cvData.experience || []).map(e => ({ role: e.role, desc: e.desc, from: e.from, to: e.to })),
        education: (cvData.education || []).map(e => ({ degree: e.degree })),
        skills: (cvData.skills || []).map(s => ({ name: s.name || s })),
        certs: (cvData.certs || []).map(c => ({ name: c.name, issuer: c.issuer })),
        projects: (cvData.projects || []).map(p => ({ name: p.name, desc: p.desc })),
      };
      const prompt = `Translate this CV JSON from Spanish to English. Return ONLY valid JSON, no markdown, no explanation. Keep proper nouns and company names as-is. Translate month names in date fields (e.g. "Enero 2022" → "January 2022").\n\n${JSON.stringify(payload)}`;
      const text = await callClaude(prompt, false);
      const clean = text.replace(/```json|```/g, "").trim();
      const translated = JSON.parse(clean);
      await supabase.from("cvs").update({ data_en: translated }).eq("id", cv.id);
      setTranslatedData(translated);
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    if (lang !== "en" || !cv) return;
    if (cv.data_en) { setTranslatedData(cv.data_en); return; }
    translateCV(cv.data);
  }, [lang, cv]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "elm-sans-font";
    style.textContent = `@font-face { font-family: 'Elm Sans'; src: url('/font/ElmsSans-VariableFont_wght.ttf') format('truetype'); font-weight: 100 900; font-style: normal; }`;
    if (!document.getElementById("elm-sans-font")) document.head.appendChild(style);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        let { data } = await supabase.from("cvs").select("*").eq("id", cvId).single();
        if (!data) {
          const { data: s } = await supabase.from("cvs").select("*").ilike("slug", `%-${cvId}`).single();
          data = s;
        }
        if (!data) { setNotFound(true); setLoading(false); return; }
        if (!data.is_public) { setNotFound("private"); setLoading(false); return; }
        setCv(data);
        setDark(data.default_theme !== "light");
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }
    load();
  }, [cvId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{css(true)}</style>
      <div className="spinner" />
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#4e4d57" }}>Cargando perfil...</div>
    </div>
  );

  if (notFound === "private") return (
    <div className="center-screen">
      <style>{css(dark, false)}</style>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "var(--ink)", marginBottom: 8 }}>Perfil privado</div>
      <div style={{ fontSize: 13, color: "var(--ink4)", fontFamily: "'DM Mono',monospace", marginBottom: 24, textAlign: "center", lineHeight: 1.6 }}>
        Este perfil no está disponible públicamente.<br/>Solo el dueño puede verlo.
      </div>
      <a href="/" className="btn btn-outline">← Volver a CVLive</a>
    </div>
  );

  if (notFound) return (
    <div className="center-screen">
      <style>{css(dark, exportMode)}</style>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 56, fontWeight: 700, color: "var(--accent)", letterSpacing: -2 }}>404</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "var(--ink)" }}>Perfil no encontrado</div>
      <div style={{ fontSize: 13, color: "var(--ink4)", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Este link no existe o fue eliminado</div>
      <a href="/" className="btn btn-outline">← Volver a CVLive</a>
    </div>
  );

  const rawD = cv.data;
  const safeName = (rawD?.personal?.name || "CV").replace(/\s+/g, "_");

  const exportVisualPDF = async () => {
    setPrintModal(false);
    const [html2canvas, { jsPDF }] = await Promise.all([
      import("html2canvas").then(m => m.default),
      import("jspdf"),
    ]);
    const source = document.getElementById("cv-print-content");
    if (!source) return;
    const wasDark = dark;
    setExportMode(true);
    if (wasDark) setDark(false);
    setSummaryExpanded(true);
    await new Promise(r => setTimeout(r, 300));
    const animatedEls = source.querySelectorAll(".header-card, .metrics-row, .card, .sidebar-card, .ai-card, .cta-card");
    animatedEls.forEach(el => { el.style.opacity = "1"; el.style.animation = "none"; el.style.transform = "none"; });
    await new Promise(r => setTimeout(r, 100));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 100));
    const totalHeight = source.scrollHeight;
    const totalWidth = source.scrollWidth;
    const canvas = await html2canvas(source, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", scrollX: 0, scrollY: 0, windowWidth: totalWidth, windowHeight: totalHeight, height: totalHeight, width: totalWidth });
    animatedEls.forEach(el => { el.style.opacity = ""; el.style.animation = ""; el.style.transform = ""; });
    setExportMode(false);
    if (wasDark) setDark(true);
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;
    let y = 0;
    while (y < imgH) { if (y > 0) pdf.addPage(); pdf.addImage(imgData, "JPEG", 0, -y, pageW, imgH); y += pageH; }
    pdf.save(safeName + "_CV.pdf");
  };

  const exportAIPDF = () => {
    setPrintModal(false);
    const d = rawD;
    import("jspdf").then(({ jsPDF }) => {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 18, lh = 6, col = 174; let y = margin;
      const txt = (text, size, bold, rgb) => { size=size||10; bold=bold||false; rgb=rgb||[30,30,30]; pdf.setFontSize(size); pdf.setFont("helvetica",bold?"bold":"normal"); pdf.setTextColor(...rgb); pdf.splitTextToSize(String(text||""),col).forEach(line=>{if(y>277){pdf.addPage();y=margin;}pdf.text(line,margin,y);y+=lh;}); };
      const sec = (t) => { y+=4; pdf.setDrawColor(200,200,200); pdf.line(margin,y,192,y); y+=5; txt(t,8,true,[140,140,140]); y+=1; };
      const p = d.personal||{};
      txt(p.name||"",20,true,[10,10,10]); y+=1; txt(p.title||"",11,false,[80,80,80]); y+=2;
      txt([p.email,p.phone,p.location].filter(Boolean).join("  |  "),9,false,[100,100,100]);
      if(p.linkedin||p.github) txt([p.linkedin,p.github].filter(Boolean).join("  |  "),9,false,[100,100,100]);
      if(p.open_to&&p.open_to.length) txt(p.open_to.map(o=>o==="Remote"?"Remote only":o==="Híbrido"?"Hybrid work":"On-site").join(" · "),9,false,[60,120,80]);
      if(d.summary){sec("SUMMARY");txt(d.summary,10);}
      if(d.experience&&d.experience.length){sec("EXPERIENCE");d.experience.forEach(e=>{txt(e.role+"  —  "+e.company,11,true);txt(e.from+" – "+(e.current?"Present":e.to),9,false,[120,120,120]);if(e.desc){y+=1;let lines=e.desc.split("\n").filter(l=>l.trim());if(lines.length<=1)lines=e.desc.split(/\.\s+/).filter(l=>l.trim()).map((l,i,a)=>i<a.length-1?l+".":l);if(lines.length>1){lines.forEach(l=>txt("• "+l.trim(),9,false,[60,60,60]));}else{txt(e.desc,9,false,[60,60,60]);}}y+=2;});}
      if(d.skills&&d.skills.length){sec("SKILLS");const cats={language:[],framework:[],tool:[]};d.skills.forEach(s=>cats[s.category||"tool"].push((s.name||s)+" ("+(s.level>=5?"Expert":s.level===4?"Advanced":s.level===3?"Intermediate":"Beginner")+")"));if(cats.language.length)txt("Languages: "+cats.language.join(", "),10);if(cats.framework.length)txt("Frameworks: "+cats.framework.join(", "),10);if(cats.tool.length)txt("Tools: "+cats.tool.join(", "),10);}
      if(d.education&&d.education.length){sec("EDUCATION");d.education.forEach(e=>{txt(e.degree+"  —  "+e.school,10,true);txt((e.from||"")+(e.to?" – "+e.to:e.current?" – Present":""),9,false,[120,120,120]);y+=1;});}
      if(d.certs&&d.certs.length){sec("CERTIFICATIONS");d.certs.forEach(c=>txt(c.name+"  ·  "+c.issuer+"  ·  "+c.date,10));}
      if(d.languages&&d.languages.length){sec("LANGUAGES");txt(d.languages.join(", "),10);}
      pdf.save(safeName+"_CV_ATS.pdf");
    });
  };


  const d = (lang === "en" && translatedData) ? {
    ...rawD,
    summary: translatedData.summary || rawD.summary,
    personal: { ...rawD.personal, title: translatedData.title || rawD.personal?.title },
    experience: (rawD.experience || []).map((exp, i) => ({
      ...exp,
      role: translatedData.experience?.[i]?.role || exp.role,
      desc: translatedData.experience?.[i]?.desc || exp.desc,
      from: translatedData.experience?.[i]?.from || exp.from,
      to: translatedData.experience?.[i]?.to || exp.to,
    })),
    education: (rawD.education || []).map((edu, i) => ({
      ...edu,
      degree: translatedData.education?.[i]?.degree || edu.degree,
    })),
    skills: (rawD.skills || []).map((s, i) => ({
      ...s,
      name: translatedData.skills?.[i]?.name || s.name || s,
    })),
    certs: (rawD.certs || []).map((c, i) => ({
      ...c,
      name: translatedData.certs?.[i]?.name || c.name,
      issuer: translatedData.certs?.[i]?.issuer || c.issuer,
    })),
    projects: (rawD.projects || []).map((p, i) => ({
      ...p,
      name: translatedData.projects?.[i]?.name || p.name,
      desc: translatedData.projects?.[i]?.desc || p.desc,
    })),
  } : rawD;
  const name = d?.personal?.name || "Sin nombre";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const currentYear = new Date().getFullYear();
  const firstJob = d?.experience?.[d.experience.length - 1];
  const startYear = firstJob ? parseInt(firstJob.from?.match(/\d{4}/)?.[0]) || currentYear : currentYear;
  const yearsExp = Math.max(0, currentYear - startYear);
  const updatedDate = new Date(cv.updated_at).toLocaleDateString(lang === "es" ? "es-AR" : "en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <style>{css(dark, exportMode)}</style>


      {/* PRINT MODAL */}
      {showContact && <ContactModal cv={cv} dark={dark} onClose={() => setShowContact(false)} />}
      {printModal && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setPrintModal(false)} />}

      {/* TOPBAR */}
      <nav className={`topbar ${scrolled ? "scrolled" : ""}`}>
        <a href="/" className="topbar-brand">LIVE<span className="sub">CV</span></a>
        <div className="topbar-right">
          <button 
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert('¡URL copiada!');
            }}
            title="Copiar enlace público"
            style={{ background: "transparent", border: "1px solid var(--border2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--ink3)", padding: "7px 13px", fontSize: 11, fontFamily: "var(--font-m)", fontWeight: 500, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--ink3)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {window.location.pathname.split('/').pop()}
          </button>
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPrintModal(v => !v)}
              style={{ background: "transparent", border: "1px solid var(--border2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--ink3)", padding: "7px 13px", fontSize: 13, fontFamily: "var(--font-b)", fontWeight: 500, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--ink3)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
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

            {printModal && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: dark ? "#16161a" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, borderRadius: 10, padding: "5px", minWidth: 210, boxShadow: "0 16px 48px rgba(0,0,0,0.4)", zIndex: 600 }}>
                {[
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
                    label: "PDF Visual", sub: "Diseño · foto · colores",
                    fn: exportVisualPDF
                  },
                  {
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13l1.5 4 1.5-4 1.5 4 1.5-4"/></svg>,
                    label: "PDF IA / ATS", sub: "Texto limpio · apto parsers",
                    fn: exportAIPDF
                  },
                ].map(({ icon, label, sub, fn }, i) => (
                  <button key={i} onClick={fn}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {icon}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-b)" }}>{label}</div>
                      <div style={{ fontSize: 10, color: "var(--ink4)", fontFamily: "var(--font-b)", marginTop: 1 }}>{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setLang(l => l === "es" ? "en" : "es")} title={lang === "es" ? "Switch to English" : "Cambiar a Español"} style={{ fontSize: 18, background: "transparent", border: "1px solid var(--border2)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", color: "var(--ink3)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--ink)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--ink3)"; }}>
            {translating ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (lang === "es" ? "🇪🇸" : "🇺🇸")}
          </button>
          <button onClick={() => setDark(d => !d)} title={dark ? "Modo claro" : "Modo oscuro"} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border2)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}>
            {dark
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </nav>

      <div className="page" id="cv-print-content">

        {/* HEADER CARD */}
        <div className="header-card">
          <div>
            <div className="header-badges">
              <span className="badge badge-available"><span className="badge-dot" />{t.available}</span>
            </div>
            <div className="header-name">{name}</div>

            {d?.personal?.title && (
              <div style={{ fontSize: 18, fontFamily: "var(--font-m)", fontWeight: 400, color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>
                {d.personal.title}
              </div>
            )}

            {d?.personal?.subtitle && (
              <div style={{ fontSize: 11, fontFamily: "var(--font-m)", color: "var(--ink3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 }}>
                {d.personal.subtitle}
              </div>
            )}

            {d?.summary && (
              <p className="header-summary">{d.summary}</p>
            )}

            <div className="header-contacts">
              {d?.personal?.open_to?.filter(o => o !== "Presencial").sort((a, b) => {
                const priority = d?.personal?.open_to?.[0];
                if (a === priority) return -1;
                if (b === priority) return 1;
                return 0;
              }).map(o => (
                <span key={o} className="contact-chip" style={{ color: "var(--ink3)", background: "transparent", border: "1px solid var(--border)" }}>
                  {lang === "es" ? "Trabajo: " : "Work: "}
                  {lang === "es" ? (o === "Remote" ? "Remoto" : "Híbrido") : (o === "Remote" ? "Remote" : "Hybrid")}
                </span>
              ))}
              {d?.personal?.email && <a href={`mailto:${d.personal.email}`} className="contact-chip">✉ {d.personal.email}</a>}
              {d?.personal?.phone && <span className="contact-chip">✆ {d.personal.phone}</span>}
              {d?.personal?.location && <span className="contact-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> {d.personal.location}</span>}
              {d?.personal?.linkedin && <a href={`https://${d.personal.linkedin}`} target="_blank" rel="noreferrer" className="contact-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"/></svg>
                LinkedIn
              </a>}
              {d?.personal?.github && <a href={`https://${d.personal.github}`} target="_blank" rel="noreferrer" className="contact-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
                GitHub
              </a>}
              {d?.personal?.website && <a href={`https://${d.personal.website}`} target="_blank" rel="noreferrer" className="contact-chip">⊕ {d.personal.website}</a>}
            </div>
          </div>
          <div className="header-right">
            <div className="avatar">
              {d?.personal?.avatar
                ? <img src={d.personal.avatar} alt={name} />
                : initials}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="main-grid">
          <div>
            {d?.experience?.length > 0 && (
              <div className="card" style={{ animationDelay: "0.22s" }}>
                <div className="card-title">{t.experience}</div>
                <div className="timeline">
                  {[...d.experience].sort((a, b) => {
                    if (a.current) return -1;
                    if (b.current) return 1;
                    const aYear = parseInt((a.to || a.from || "0").match(/\d{4}/)?.[0]) || 0;
                    const bYear = parseInt((b.to || b.from || "0").match(/\d{4}/)?.[0]) || 0;
                    return bYear - aYear;
                  }).map((exp, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-date">
                        {exp.current ? <div className="timeline-current">{t.present}</div> : <div>{exp.to}</div>}
                        <div>{exp.from}</div>
                        {calcDuration(exp.from, exp.to, exp.current, lang) && (
                          <div style={{ fontSize: 10, fontFamily: "var(--font-m)", opacity: 0.55, marginTop: 4, letterSpacing: "0.3px" }}>
                            {calcDuration(exp.from, exp.to, exp.current, lang)}
                          </div>
                        )}
                      </div>
                      <div className="timeline-body">
                        <div className="timeline-role">{exp.role}</div>
                        <div className="timeline-company">{exp.company}</div>
                        {exp.desc && (
                          <div className="timeline-desc">
                            {(() => {
                              // Split by newline, or fallback to ". " for old single-block text
                              const lines = exp.desc.split("\n").filter(l => l.trim());
                              const items = lines.length > 1 ? lines : exp.desc.split(/\.\s+/).filter(l => l.trim()).map((l,i,a) => i < a.length-1 ? l+"." : l);
                              return items.length > 1
                                ? <ul style={{ paddingLeft: 16, margin: 0, display:"flex", flexDirection:"column", gap:4 }}>
                                    {items.map((line, i) => <li key={i} style={{ lineHeight:1.5 }}>{line.trim()}</li>)}
                                  </ul>
                                : <span>{exp.desc}</span>;
                            })()
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {d?.projects?.length > 0 && (
              <div className="card" style={{ animationDelay: "0.3s" }}>
                <div className="card-title">{t.projects}</div>
                <div className="projects-list">
                  {d.projects.map((proj, i) => (
                    <div className="project-item" key={i}>
                      <div className="project-name">{proj.name}</div>
                      {proj.url && <div className="project-url">⊕ {proj.url}</div>}
                      {proj.desc && <div className="project-desc">{proj.desc}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* SIDEBAR */}
          <div>
            {d?.skills?.length > 0 && (
              <div className="sidebar-card" style={{ animationDelay: "0.22s" }}>
                <div className="sidebar-card-title">{t.skills}</div>
                <div className="skills-wrap">
                  {(() => {
                    const sorted = [...d.skills].sort((a, b) => (b.level || 3) - (a.level || 3));
                    const langs = sorted.filter(s => s.category === "language");
                    const frameworks = sorted.filter(s => s.category === "framework");
                    const tools = sorted.filter(s => !s.category || s.category === "tool");
                    const catLabel = { language: lang === "es" ? "Lenguajes" : "Languages", framework: "Frameworks", tool: lang === "es" ? "Herramientas" : "Tools" };
                    const renderSkill = (s, i) => {
                      const name = s.name || s;
                      const level = s.level || 3;
                      const pct = (level / 5) * 100;
                      const tagInfo = level >= 5
                        ? { label: lang === "es" ? "Experto"      : "Expert",       cls: "skill-tag-expert",       color: "var(--accent)" }
                        : level === 4
                        ? { label: lang === "es" ? "Avanzado"     : "Advanced",     cls: "skill-tag-advanced",     color: "#6495d4" }
                        : level === 3
                        ? { label: lang === "es" ? "Intermedio"   : "Intermediate", cls: "skill-tag-intermediate", color: "var(--ink3)" }
                        : { label: lang === "es" ? "Principiante" : "Beginner",     cls: "skill-tag-beginner",     color: "var(--ink4)" };
                      return (
                        <div className="skill-row" key={i}>
                          <div className="skill-header">
                            <span className="skill-name">{name}</span>
                            <span className={`skill-tag ${tagInfo.cls}`}>{tagInfo.label}</span>
                          </div>
                          <div className="skill-bar-track">
                            <div className="skill-bar-fill" style={{ width: `${pct}%`, background: tagInfo.color }} />
                          </div>
                        </div>
                      );
                    };
                    const renderGroup = (items, key) => items.length === 0 ? null : (
                      <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(langs.length + frameworks.length + tools.length > items.length || [langs,frameworks,tools].filter(g=>g.length>0).length > 1) &&
                          <div style={{ fontSize: 9, fontFamily: "var(--font-b)", fontWeight: 700, color: "var(--ink4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2, marginTop: key !== "language" ? 10 : 0 }}>{catLabel[key]}</div>
                        }
                        {items.map(renderSkill)}
                      </div>
                    );
                    return <>{renderGroup(langs, "language")}{renderGroup(frameworks, "framework")}{renderGroup(tools, "tool")}</>;
                  })()}
                </div>
              </div>
            )}

            {d?.portfolio?.length > 0 && (
              <div className="sidebar-card" style={{ animationDelay: "0.24s" }}>
                <div className="sidebar-card-title">{t.portfolio}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {d.portfolio.map((item, i) => {
                    const label = item.label || "";
                    const low = label.toLowerCase();
                    const icon = low.includes("behance")
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 11.2c.8-.3 1.4-1 1.4-2 0-2-1.5-2.7-3.3-2.7H1v10.8h5.1c2 0 3.6-.9 3.6-3.1 0-1.3-.7-2.4-1.9-3zm-4.6-3h2.4c.7 0 1.4.2 1.4 1s-.5 1.1-1.3 1.1H3.2V8.2zm2.7 6.1H3.2v-2.5h2.8c.9 0 1.5.4 1.5 1.3s-.7 1.2-1.6 1.2zm8.9-7.7h4.4v1H14.8v-1zm2.4 2.3c-2.4 0-3.9 1.6-3.9 4s1.4 4 3.9 4c1.8 0 3-.9 3.6-2.5h-1.8c-.2.6-.9 1-1.7 1-1.1 0-1.8-.6-1.9-1.8h5.5c0-.2.1-.5.1-.7 0-2.4-1.4-4-3.8-4zm-1.8 3.2c.1-1 .8-1.7 1.8-1.7s1.6.7 1.7 1.7h-3.5z"/></svg>
                      : low.includes("dribbble")
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.6 4.8c1.1 1.4 1.8 3.1 1.9 5-.3-.1-3-.6-5.7-.3-.1-.2-.1-.4-.2-.6-.2-.5-.4-1-.6-1.4 2.7-1.1 4.1-2.6 4.6-2.7zM12 4c1.9 0 3.6.7 4.9 1.8-.4.6-1.7 1.9-4.2 2.9-1.3-2.4-2.8-4.4-3-4.7.7-.1 1.5-.1 2.3 0zm-4.7.9c.2.3 1.6 2.3 3 4.6-3.8 1-7.1 1-7.5 1 .5-2.5 2.1-4.6 4.5-5.6zM4 12.1v-.4c.3 0 4.3.1 8.4-1.2.2.5.4.9.6 1.4-.1 0-.2.1-.3.1-4.2 1.4-6.5 5.2-6.7 5.5C4.8 15.9 4 14.1 4 12.1zm8 7.9c-1.7 0-3.3-.6-4.5-1.5.2-.3 2-3.6 6.6-5.3h.1c1.2 3.1 1.6 5.7 1.7 6.3-1.2.3-2.5.5-3.9.5zm5.8-1.5c-.1-.6-.5-3-1.6-6 2.5-.4 4.7.3 5 .4-.4 2.4-1.8 4.4-3.4 5.6z"/></svg>
                      : low.includes("github")
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
                      : low.includes("linkedin")
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
                    return (
                      <a key={i} href={item.url} target="_blank" rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--ink)", padding: "3px 0" }}>
                        <span style={{ color: dark ? "#fff" : "#000", opacity: 0.7, flexShrink: 0, display: "flex", width: 26, height: 26, borderRadius: 6, background: "var(--accent-b)", border: "1px solid var(--accent-s)", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>{icon}</span>
                        <span style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500 }}>{label}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent)" }}>↗</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {d?.certs?.length > 0 && (() => {
              const withUrl = d.certs.filter(c => c.url);
              const withoutUrl = d.certs.filter(c => !c.url);
              return <>
                {withUrl.length > 0 && (
                  <div className="sidebar-card" style={{ animationDelay: "0.26s" }}>
                    <div className="sidebar-card-title">{t.certifications}</div>
                    <div className="cert-list">
                      {withUrl.map((cert, i) => (
                        <div className="cert-item" key={i}>
                          <div className="cert-icon">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                          </div>
                          <div>
                            <div className="cert-name">{cert.name}</div>
                            {cert.issuer && <div className="cert-meta">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>}
                            <a href={cert.url} target="_blank" rel="noreferrer" className="cert-link" onClick={e => e.stopPropagation()}>Ver certificado ↗</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {withoutUrl.length > 0 && (
                  <div className="sidebar-card" style={{ animationDelay: "0.28s" }}>
                    <div className="sidebar-card-title">{t.training}</div>
                    <div className="cert-list">
                      {withoutUrl.map((cert, i) => (
                        <div className="cert-item" key={i}>
                          <div className="cert-icon-soft">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                          </div>
                          <div>
                            <div className="cert-name-soft">{cert.name}</div>
                            {cert.issuer && <div className="cert-meta">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>;
            })()}

            {d?.education?.length > 0 && (
              <div className="sidebar-card" style={{ animationDelay: "0.30s" }}>
                <div className="sidebar-card-title">{t.education}</div>
                <div className="edu-list">
                  {(() => {
                    const items = d.education.map((edu, i) => {
                      const deg = (edu.degree || "").toLowerCase();
                      const isFormal = edu.type === "degree" || edu.type === "postgrad" ||
                      (!edu.type && (deg.includes("licenc") || deg.includes("ingeni") || deg.includes("doctor") || deg.includes("master") || deg.includes("maestr") || deg.includes("bachiller") || deg.includes("posgrado") || deg.includes("postgrado") || deg.includes("especializ") || deg.includes("maestría")));
                      const isOngoing = edu.current === true;
                      const icon = isFormal
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
                      return { edu, i, isFormal, isOngoing, icon };
                    });
                    const formal = items.filter(x => x.isFormal);
                    const secondary = items.filter(x => !x.isFormal);
                    const renderItem = ({ edu, i, isFormal, isOngoing, icon }) => (
                      <div className={`edu-item ${isFormal ? "" : "edu-secondary"}`} key={i}>
                        <div className="edu-icon">{icon}</div>
                        <div>
                          <div className="edu-degree">
                            {edu.degree}
                            {isFormal && (
                              <span className={`edu-tag ${isOngoing ? "edu-tag-ongoing" : "edu-tag-graduated"}`}>
                                {isOngoing ? (lang === "es" ? "En curso" : "Ongoing") : (lang === "es" ? "Graduado" : "Graduated")}
                              </span>
                            )}
                          </div>
                          <div className="edu-school">{edu.school}</div>
                          {edu.from && <div className="edu-year">{edu.from}{edu.to && edu.to !== edu.from ? ` – ${edu.to}` : ""}</div>}
                        </div>
                      </div>
                    );
                    return <>
                      {formal.map(renderItem)}
                      {formal.length > 0 && secondary.length > 0 && <div className="edu-divider" />}
                      {secondary.map(renderItem)}
                    </>;
                  })()}
                </div>
              </div>
            )}

            {d?.languages?.length > 0 && (
              <div className="sidebar-card" style={{ animationDelay: "0.26s" }}>
                <div className="sidebar-card-title">{t.languages}</div>
                <div className="lang-list">
                  {d.languages.map((l, i) => {
                    const str = typeof l === "string" ? l : (l?.name || String(l));
                    const parts = str.split(/\s+(nativo|C[12]|B[12]|A[12]|fluente|básico|native|fluent|basic)/i);
                    return (
                      <div className="lang-item" key={i}>
                        <span className="lang-name">{parts[0]?.trim() || str}</span>
                        {parts[1] && <span className="lang-level">{parts[1]}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-text" style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "var(--font-m)", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
          © 2026 LIVECV
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "var(--font-m)", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
            {t.hecho}
            <svg width="12" height="11" viewBox="0 0 12 11" fill="var(--accent)" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M6 10.5S0.5 7 0.5 3.5A2.5 2.5 0 0 1 5.5 2.5a.5.5 0 0 0 1 0A2.5 2.5 0 0 1 11.5 3.5C11.5 7 6 10.5 6 10.5Z"/>
            </svg>
            {t.por}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 16, color: dark ? "#fff" : "#000", letterSpacing: -0.5, lineHeight: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            LIVE<span style={{ fontWeight: 300, fontSize: 7, opacity: dark ? 0.55 : 0.6, marginTop: -1, color: dark ? "#fff" : "#555" }}>CV</span>
          </div>
        </div>
        <a href="/" className="footer-cta" style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "var(--font-m)", color: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)", textDecoration: "none" }}>{t.cta}</a>
      </footer>
    </div>
  );
}