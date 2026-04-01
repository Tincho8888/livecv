import { supabase } from "../lib/supabase";

// ─── AUTH ─────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) console.error(error);
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ─── CV CRUD ──────────────────────────────────────────────
export async function fetchCVs(userId) {
  const { data, error } = await supabase
    .from("cvs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveCV(userId, cvId, title, data) {
  const slug =
    title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  if (cvId) {
    const { data: updated, error } = await supabase
      .from("cvs")
      .update({ title, data, updated_at: new Date().toISOString() })
      .eq("id", cvId)
      .select()
      .single();
    if (error) throw error;
    return updated;
  } else {
    const { data: created, error } = await supabase
      .from("cvs")
      .insert({ user_id: userId, title, data, slug })
      .select()
      .single();
    if (error) throw error;
    return created;
  }
}

export async function deleteCV(cvId) {
  const { error } = await supabase.from("cvs").delete().eq("id", cvId);
  if (error) throw error;
}

export async function updateCVMeta(cvId, meta) {
  const { error } = await supabase.from("cvs").update(meta).eq("id", cvId);
  if (error) throw error;
}

// ─── AVATAR UPLOAD ────────────────────────────────────────
export async function uploadAvatar(userId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;
  await supabase.storage.from("avatars").remove([path]);
  const { error } = await supabase.storage.from("avatars").upload(path, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  return urlData.publicUrl + "?t=" + Date.now();
}