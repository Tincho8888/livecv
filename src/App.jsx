import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/global.css";
import { supabase }                    from "./lib/supabase";
import { fetchCVs, saveCV, deleteCV, updateCVMeta } from "./services/cvService";
import { parseCVFromPDF }              from "./services/aiService";
import { exportVisualPDF }             from "./services/pdfService";
import { defaultData, completion }     from "./lib/cvDefaults";
import Nav                             from "./components/layout/Nav";
import { DropZone }                    from "./components/layout/Overlays";
import AuthModal                       from "./components/layout/AuthModal";
import DashboardPage                   from "./pages/DashboardPage";
import LandingPage                     from "./pages/LandingPage";
import EditorForm                      from "./components/editor/EditorForm";
import JobMatchPanel                   from "./components/editor/JobMatchPanel";
import EditorSidebar                   from "./components/editor/EditorSidebar";
import ShareModal                      from "./components/modals/ShareModal";
import ExportModal                     from "./components/modals/ExportModal";

const SAVE_DELAY = 1500;

export default function App() {
  const [session, setSession]     = useState(undefined);
  const [screen, setScreen]       = useState("landing");
  const [showAuth, setShowAuth]   = useState(false);

  // CV list
  const [cvList, setCvList]           = useState([]);
  const [cvsLoading, setCvsLoading]   = useState(false);

  // Editor
  const [currentCvId, setCurrentCvId] = useState(null);
  const [cvTitle, setCvTitle]         = useState("Mi CV");
  const [data, setData]               = useState(defaultData);
  const [dark, setDark]               = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [isPublic, setIsPublic]       = useState(false);
  const [defaultTheme, setDefaultTheme] = useState("dark");
  const [saveStatus, setSaveStatus]   = useState("saved");
  const saveTimer                     = useRef(null);

  // Modals
  const [showShare, setShowShare]     = useState(false);
  const [showExport, setShowExport]   = useState(false);

  // Drag & drop
  const [isDragging, setIsDragging]   = useState(false);
  const [importing, setImporting]     = useState(false);

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    // Restaurar estado del editor desde sessionStorage
    const saved = sessionStorage.getItem("editor_state");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.screen) setScreen(s.screen);
        if (s.currentCvId) setCurrentCvId(s.currentCvId);
        if (s.cvTitle) setCvTitle(s.cvTitle);
        if (s.data) setData(s.data);
      } catch {}
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      if (session) {
        if (!saved || JSON.parse(saved || "{}").screen !== "editor") setScreen("dashboard");
        loadCVs(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      setSession(session ?? null);
      if (session) {
        setScreen("dashboard");
        loadCVs(session.user.id);
      } else {
        setScreen("landing");
        setCvList([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persistir estado del editor en sessionStorage
  useEffect(() => {
    if (screen === "editor") {
      sessionStorage.setItem("editor_state", JSON.stringify({ screen, currentCvId, cvTitle, data }));
    } else {
      sessionStorage.removeItem("editor_state");
    }
  }, [screen, currentCvId, cvTitle, data]);

  // Drag & drop global
  useEffect(() => {
    const onDragOver  = e => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = e => { if (!e.relatedTarget) setIsDragging(false); };
    const onDrop      = e => {
      e.preventDefault(); setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleImportFile(f);
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [session]);

  // ── CVs ───────────────────────────────────────────────────
  async function loadCVs(userId) {
    setCvsLoading(true);
    try { setCvList(await fetchCVs(userId) || []); }
    catch(e) { console.error(e); }
    finally { setCvsLoading(false); }
  }

  function openCV(cv) {
    setCurrentCvId(cv.id);
    setCvTitle(cv.title || "Mi CV");
    setData(cv.data || defaultData);
    setIsPublic(cv.is_public || false);
    setDefaultTheme(cv.default_theme || "dark");
    setDark(cv.default_theme === "light" ? false : true);
    setActiveSection("personal");
    setScreen("editor");
    setSaveStatus("saved");
  }

  function newCV() {
    setCurrentCvId(null);
    setCvTitle("Mi CV");
    setData(defaultData);
    setIsPublic(false);
    setDefaultTheme("dark");
    setDark(true);
    setActiveSection("personal");
    setScreen("editor");
    setSaveStatus("saved");
  }

  async function handleDelete(e, cvId) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este CV?")) return;
    try {
      await deleteCV(cvId);
      setCvList(prev => prev.filter(c => c.id !== cvId));
    } catch(e) { console.error(e); }
  }

  // ── Autosave ──────────────────────────────────────────────
  const triggerSave = useCallback(async (dataToSave, title) => {
    if (!session) return;
    setSaveStatus("saving");
    try {
      const saved = await saveCV(session.user.id, currentCvId, title, dataToSave);
      if (!currentCvId && saved?.id) setCurrentCvId(saved.id);
      setSaveStatus("saved");
      loadCVs(session.user.id);
    } catch(e) {
      console.error(e);
      setSaveStatus("error");
    }
  }, [session, currentCvId]);

  function handleDataChange(updaterOrData) {
    // EditorForm pasa una función updater (p => {...p, ...}), no el dato directo
    setData(prev => {
      const newData = typeof updaterOrData === "function" ? updaterOrData(prev) : updaterOrData;
      setSaveStatus("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => triggerSave(newData, cvTitle), SAVE_DELAY);
      return newData;
    });
  }

  function handleTitleChange(t) {
    setCvTitle(t);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => triggerSave(data, t), SAVE_DELAY);
  }

  // ── Import PDF ────────────────────────────────────────────
  async function handleImportFile(file) {
    if (!session) { setShowAuth(true); return; }
    setImporting(true);
    try {
      const parsed = await parseCVFromPDF(file);
      if (parsed) {
        // Normalizar skills — asegurar que tienen name y level
        if (parsed.skills) {
          parsed.skills = parsed.skills.map((s, i) => ({
            name: typeof s === "string" ? s : (s.name || "Skill"),
            level: s.level || 3,
            category: s.category || "tool",
          }));
        }
        // Deduplicate skills por nombre
        if (parsed.skills) {
          const seen = new Set();
          parsed.skills = parsed.skills.filter(s => {
            if (seen.has(s.name)) return false;
            seen.add(s.name);
            return true;
          });
        }
        const title = parsed.personal?.name ? `CV — ${parsed.personal.name}` : "Mi CV";
        setData(parsed);
        setCvTitle(title);
        setCurrentCvId(null);
        setActiveSection("personal");
        setScreen("editor");
        setSaveStatus("unsaved");
        saveTimer.current = setTimeout(() => triggerSave(parsed, title), SAVE_DELAY);
      }
    } catch(e) { console.error(e); alert("Error al importar el CV. Intentá de nuevo."); }
    finally { setImporting(false); }
  }

  // ── Toggles ───────────────────────────────────────────────
  async function handleTogglePublic(val) {
    setIsPublic(val);
    if (currentCvId) {
      try { await updateCVMeta(currentCvId, { is_public: val }); } catch {}
    }
  }

  async function handleToggleTheme(theme) {
    setDefaultTheme(theme);
    setDark(theme !== "light");
    if (currentCvId) {
      try { await updateCVMeta(currentCvId, { default_theme: theme }); } catch {}
    }
  }

  // ── Loading ───────────────────────────────────────────────
  if (session === undefined || importing) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0b", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
      <div className="spinner" />
      {importing && <div style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>Importando CV con IA...</div>}
    </div>
  );

  const pct = completion(data);

  return (
    <div className="app">
      <Nav
        session={session}
        screen={screen}
        saveStatus={saveStatus}
        onLogoClick={() => setScreen(session ? "dashboard" : "landing")}
        onGoToDashboard={() => setScreen("dashboard")}
        onShowAuth={() => setShowAuth(true)}
        onExportVisual={() => setShowExport(true)}
        onExportAI={() => exportVisualPDF(data)}
        onShare={() => {
          if (!currentCvId) return;
          window.open(`${window.location.origin}/cv/${currentCvId}`, "_blank");
        }}
        isPublic={isPublic}
        onTogglePublic={handleTogglePublic}
        currentCvId={currentCvId}
      />

      {showAuth   && <AuthModal onClose={() => setShowAuth(false)} />}
      {showShare  && <ShareModal data={data} cvId={currentCvId} onClose={() => setShowShare(false)} />}
      {showExport && <ExportModal data={data} onClose={() => setShowExport(false)} />}
      <DropZone visible={isDragging} />

      {screen === "landing" && (
        <LandingPage
          session={session}
          onNewCv={newCV}
          onImported={parsedData => { setData(parsedData); newCV(); }}
          onShowAuth={() => setShowAuth(true)}
          setImporting={setImporting}
        />
      )}

      {screen === "dashboard" && session && (
        <DashboardPage
          session={session}
          cvList={cvList}
          cvsLoading={cvsLoading}
          onOpen={openCV}
          onNew={newCV}
          onDelete={handleDelete}
          onImportFile={handleImportFile}
        />
      )}

      {screen === "editor" && (
        <div className="editor-layout">
          <EditorSidebar
            active={activeSection}
            onSelect={setActiveSection}
            data={data}
            pct={pct}
            cvTitle={cvTitle}
            onCvTitleChange={handleTitleChange}
            currentCvId={currentCvId}
            isPublic={isPublic}
            defaultTheme={defaultTheme}
            onTogglePublic={handleTogglePublic}
            onToggleTheme={handleToggleTheme}
            onGoToDashboard={() => setScreen("dashboard")}
          />
          <div className="form-panel">
            <EditorForm
              active={activeSection}
              data={data}
              session={session}
              onUpdate={handleDataChange}
            />
          </div>
          <JobMatchPanel data={data} />
        </div>
      )}
    </div>
  );
}