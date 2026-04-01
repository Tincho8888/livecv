// ─── CLAUDE API ───────────────────────────────────────────
export async function callClaude(prompt, useSonnet = false) {
  const res = await fetch("/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: useSonnet ? "claude-sonnet-4-20250514" : "claude-haiku-4-5-20251001",
      max_tokens: useSonnet ? 3000 : 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── PDF IMPORT ───────────────────────────────────────────
export async function parseCVFromPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n";
  }

  const prompt = `Extraé TODOS los datos de este CV en formato JSON. Seguí las reglas de clasificación estrictamente.

REGLAS DE CLASIFICACIÓN — MUY IMPORTANTE:

"experience": SOLO si el texto aparece bajo secciones llamadas "Experiencia", "Experiencia laboral", "Trabajo", "Work Experience" o similares. Debe ser un empleo real con empresa y cargo.

"certs": Todo lo que aparece bajo secciones llamadas "Formación complementaria", "Cursos", "Capacitaciones", "Certificaciones", "Talleres", "Formación adicional", "Educación complementaria", o cualquier sección que NO sea experiencia laboral formal ni educación universitaria. Si una organización como una fundación, ONG o institución educativa aparece en una sección de formación/cursos, va a "certs" aunque tenga un rol descriptivo como "mentora" o "participante".

"education": SOLO carreras universitarias, terciarios, secundario, posgrados, maestrías que aparezcan bajo secciones de educación formal.

REGLA CLAVE: El contexto de la sección del CV manda. Si algo aparece bajo "Formación Complementaria", va a certs SIEMPRE, sin importar cómo esté redactado.

FORMATO DEL CAMPO "desc" EN EXPERIENCIA — MUY IMPORTANTE:
- Si hay múltiples responsabilidades o logros, separalos con \n (salto de línea) en el string JSON.
- Cada responsabilidad en una línea separada, sin guiones ni bullets, solo el texto limpio.
- Ejemplo: "Gestionar presupuesto de RRHH\nAdministrar compensaciones y escalas salariales\nAnalizar métricas y KPIs"

- Incluí TODAS las entradas de cada sección sin omitir ninguna.
- Si "projects" está vacío en el CV devolvé [].
- Devolvé SOLO el JSON sin markdown ni explicaciones.

{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "", "github": "" },
  "summary": "",
  "experience": [{ "id": 1, "role": "", "company": "", "from": "", "to": "", "current": false, "desc": "responsabilidad1\nresponsabilidad2\nresponsabilidad3", "type": "empleo" }],
  "education": [{ "id": 1, "degree": "", "school": "", "from": "", "to": "", "current": false }],
  "skills": [{ "name": "", "category": "tool" }],
  "languages": [],
  "certs": [{ "id": 1, "name": "", "issuer": "", "date": "" }],
  "projects": []
}

Texto del CV:
${fullText.slice(0, 8000)}`;

  // Try Haiku first, fallback to Sonnet if parsing fails
  let parsed;
  for (const useSonnet of [false, true]) {
    try {
      const response = await callClaude(prompt, useSonnet);
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON returned");
      parsed = JSON.parse(match[0]);
      if (!parsed.personal) throw new Error("Invalid structure");
      break;
    } catch (e) {
      if (useSonnet) throw e; // both failed
    }
  }

  // Asegurar IDs únicos
  if (parsed.experience)
    parsed.experience = parsed.experience.map((e, i) => ({ ...e, id: Date.now() + i }));
  if (parsed.education)
    parsed.education = parsed.education.map((e, i) => ({ ...e, id: Date.now() + 100 + i }));
  if (parsed.projects)
    parsed.projects = parsed.projects.map((e, i) => ({ ...e, id: Date.now() + 200 + i }));

  return parsed;
}