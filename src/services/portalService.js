import { supabase } from "../lib/supabase";

export async function getPortalBySlug(slug) {
  const { data, error } = await supabase
    .from("recruiter_profiles")
    .select("id, company, slug, portal_active, portal_headline, portal_color, portal_logo_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOpenSearches(recruiterId) {
  const { data } = await supabase
    .from("searches")
    .select("id, title, query, priority, sla_days, created_at")
    .eq("owner_id", recruiterId)
    .eq("status", "abierta")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function submitApplication({ recruiterId, searchId, name, email, linkedin, message, cvData, cvTitle }) {
  // Guardar CV en tabla cvs
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    + "-" + Math.random().toString(36).slice(2, 6);

  const { data: cv, error } = await supabase.from("cvs").insert({
    title:               cvTitle || "CV — " + name,
    slug,
    data:                cvData,
    is_public:           true,
    source_recruiter_id: recruiterId,
    applicant_message:   message || null,
    // search_id para conectar al pipeline
  }).select("id").single();

  if (error) throw error;
  return cv;
}