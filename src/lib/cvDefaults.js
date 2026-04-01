export const defaultData = {
  personal: {
    name: "", title: "", subtitle: "", email: "", phone: "",
    location: "", website: "", linkedin: "", github: "", open_to: [],
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certs: [],
  portfolio: [],
};

export const SECTIONS = [
  { id: "personal",   label: "Personal Info",   icon: "◈" },
  { id: "summary",    label: "Resumen",          icon: "◉" },
  { id: "experience", label: "Experiencia",      icon: "◆" },
  { id: "education",  label: "Educación",        icon: "◇" },
  { id: "skills",     label: "Skills",           icon: "◈" },
  { id: "portfolio",  label: "Portfolio",        icon: "⊞" },
  { id: "certs",      label: "Certificaciones",  icon: "✦" },
  { id: "languages",  label: "Idiomas",          icon: "◐" },
];

export function completion(d) {
  let s = 0;
  if (d.personal.name)      s += 15;
  if (d.personal.email)     s += 10;
  if (d.personal.title)     s += 10;
  if (d.summary)            s += 15;
  if (d.experience?.length) s += 25;
  if (d.education?.length)  s += 15;
  if (d.skills?.length)     s += 10;
  return Math.min(s, 100);
}

export const THEMES = {
  dark: {
    name: "Dark Luxury", desc: "Oscuro y elegante",
    bg: "#0d0d0f", headerBg: "#111113", text: "#f0ede8",
    textSoft: "#a09fa8", textMuted: "#6b6a72", accent: "#c8a96e",
    border: "rgba(255,255,255,0.1)", skillBg: "#18181c",
    skillBorder: "rgba(255,255,255,0.1)",
  },
  light: {
    name: "Light Clásico", desc: "Profesional y limpio",
    bg: "#faf9f7", headerBg: "#f0ede8", text: "#1a1a1a",
    textSoft: "#4a4a52", textMuted: "#888", accent: "#b8945a",
    border: "#e0ddd8", skillBg: "#f0ede8", skillBorder: "#dddad4",
  },
  minimal: {
    name: "Minimal ATS", desc: "Máxima compatibilidad",
    bg: "#ffffff", headerBg: "#ffffff", text: "#111",
    textSoft: "#333", textMuted: "#777", accent: "#111",
    border: "#ccc", skillBg: "#f5f5f5", skillBorder: "#ddd",
  },
};