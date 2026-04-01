import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function JobsPortalPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [postings, setPostings] = useState([]);
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [error, setError] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    location: "",
    modality: "",
    department: "",
  });

  useEffect(() => {
    loadPortal();
  }, [slug]);

  async function loadPortal() {
    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from("recruiter_profiles")
        .select("*")
        .eq("slug", slug)
        .eq("portal_active", true)
        .single();

      if (profileError || !profileData) {
        setError("Portal no encontrado o inactivo");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: postingsData, error: postingsError } = await supabase
        .from("job_postings")
        .select("*")
        .eq("recruiter_id", profileData.user_id)
        .eq("active", true)
        .order("published_at", { ascending: false });

      if (postingsError) throw postingsError;

      setPostings(postingsData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading portal:", err);
      setError("Error al cargar el portal");
      setLoading(false);
    }
  }

  const accentColor = profile?.portal_color || "#1d4ed8";
  
  // Aplicar filtros
  const filteredPostings = postings.filter(p => {
    if (filters.location && !p.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.modality && p.modality !== filters.modality) return false;
    if (filters.department && p.department !== filters.department) return false;
    return true;
  });

  // Extraer opciones únicas para filtros
  const uniqueLocations = [...new Set(postings.map(p => p.location).filter(Boolean))];
  const uniqueModalities = [...new Set(postings.map(p => p.modality).filter(Boolean))];
  const uniqueDepartments = [...new Set(postings.map(p => p.department).filter(Boolean))];

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #e5e5e5",
          borderTopColor: accentColor,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        padding: "24px",
      }}>
        <div style={{
          background: "white",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: "48px 32px",
          textAlign: "center",
          maxWidth: 400,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#171717", marginBottom: 8 }}>
            {error}
          </h2>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 24 }}>
            Verifica que la URL sea correcta
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: accentColor,
              color: "white",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const bannerUrl = profile.portal_banner_url || `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}44 100%)`;
  const isBannerGradient = bannerUrl.startsWith('linear-gradient');

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Hero Banner */}
      <div style={{
        height: 240,
        background: isBannerGradient ? bannerUrl : `url(${bannerUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)",
        }} />
      </div>

      {/* Company Header */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #e5e5e5",
        marginTop: -60,
        position: "relative",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 20 }}>
            {/* Logo */}
            <div style={{
              width: 120,
              height: 120,
              background: profile.portal_logo_url ? `url(${profile.portal_logo_url})` : "white",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "4px solid white",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: accentColor,
            }}>
              {!profile.portal_logo_url && profile.company?.charAt(0)}
            </div>

            {/* Company Info */}
            <div style={{ flex: 1, paddingTop: 40 }}>
              <h1 style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#171717",
                marginBottom: 8,
                letterSpacing: "-0.5px",
              }}>
                {profile.company}
              </h1>
              {profile.portal_headline && (
                <p style={{ fontSize: 16, color: "#525252", marginBottom: 12 }}>
                  {profile.portal_headline}
                </p>
              )}
              <div style={{
                display: "flex",
                gap: 16,
                fontSize: 14,
                color: "#737373",
              }}>
                {profile.company_location && (
                  <span>📍 {profile.company_location}</span>
                )}
                {profile.company_size && (
                  <span>👥 {profile.company_size}</span>
                )}
                <span style={{ color: accentColor, fontWeight: 500 }}>
                  {postings.length} {postings.length === 1 ? 'posición abierta' : 'posiciones abiertas'}
                </span>
              </div>
            </div>
          </div>

          {/* About Section */}
          {profile.company_about && (
            <div style={{
              background: "#f9fafb",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: "20px 24px",
              marginTop: 20,
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#171717",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Acerca de nosotros
              </h3>
              <p style={{
                fontSize: 14,
                color: "#525252",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {profile.company_about}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters + Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        {/* Filters */}
        {postings.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}>
            <input
              type="text"
              placeholder="Buscar por ubicación..."
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              style={{
                padding: "10px 14px",
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                fontSize: 14,
                background: "white",
              }}
            />
            <select
              value={filters.modality}
              onChange={e => setFilters(f => ({ ...f, modality: e.target.value }))}
              style={{
                padding: "10px 14px",
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                fontSize: 14,
                background: "white",
              }}
            >
              <option value="">Todas las modalidades</option>
              {uniqueModalities.map(m => (
                <option key={m} value={m} style={{ textTransform: "capitalize" }}>{m}</option>
              ))}
            </select>
            {uniqueDepartments.length > 0 && (
              <select
                value={filters.department}
                onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                  fontSize: 14,
                  background: "white",
                }}
              >
                <option value="">Todos los departamentos</option>
                {uniqueDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Job Listings */}
        {filteredPostings.length === 0 ? (
          <div style={{
            background: "white",
            border: "2px dashed #e5e5e5",
            borderRadius: 12,
            padding: "64px 32px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 15, color: "#737373" }}>
              {postings.length === 0 
                ? "No hay posiciones abiertas en este momento" 
                : "No hay posiciones que coincidan con los filtros"}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredPostings.map(posting => (
              <div
                key={posting.id}
                onClick={() => setSelectedPosting(posting)}
                style={{
                  background: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: "24px 28px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}15`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#e5e5e5";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#171717",
                      marginBottom: 6,
                    }}>
                      {posting.title}
                    </h3>
                    {posting.department && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: accentColor,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}>
                        {posting.department}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      alert(`Aplicar a: ${posting.title}`);
                    }}
                    style={{
                      padding: "8px 20px",
                      background: accentColor,
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  fontSize: 14,
                  color: "#737373",
                }}>
                  {posting.location && <span>📍 {posting.location}</span>}
                  {posting.modality && (
                    <span style={{ textTransform: "capitalize" }}>💼 {posting.modality}</span>
                  )}
                  {(posting.salary_min || posting.salary_max) && (
                    <span>
                      💰 {posting.salary_min && `${posting.salary_min.toLocaleString()}`}
                      {posting.salary_min && posting.salary_max && " - "}
                      {posting.salary_max && `${posting.salary_max.toLocaleString()}`}
                      {" "}{posting.currency}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selectedPosting && (
        <div
          onClick={() => setSelectedPosting(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "32px",
              maxWidth: 700,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#171717",
              marginBottom: 8,
            }}>
              {selectedPosting.title}
            </h2>
            {selectedPosting.department && (
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                {selectedPosting.department}
              </span>
            )}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              fontSize: 14,
              color: "#737373",
              margin: "16px 0 24px",
              paddingBottom: 24,
              borderBottom: "1px solid #e5e5e5",
            }}>
              {selectedPosting.location && <span>📍 {selectedPosting.location}</span>}
              {selectedPosting.modality && (
                <span style={{ textTransform: "capitalize" }}>💼 {selectedPosting.modality}</span>
              )}
              {(selectedPosting.salary_min || selectedPosting.salary_max) && (
                <span>
                  💰 {selectedPosting.salary_min && `${selectedPosting.salary_min.toLocaleString()}`}
                  {selectedPosting.salary_min && selectedPosting.salary_max && " - "}
                  {selectedPosting.salary_max && `${selectedPosting.salary_max.toLocaleString()}`}
                  {" "}{selectedPosting.currency}
                </span>
              )}
            </div>
            {selectedPosting.description && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#171717",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Descripción
                </h3>
                <p style={{
                  fontSize: 15,
                  color: "#525252",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}>
                  {selectedPosting.description}
                </p>
              </div>
            )}
            {selectedPosting.requirements?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#171717",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Requisitos
                </h3>
                <ul style={{
                  fontSize: 15,
                  color: "#525252",
                  lineHeight: 1.7,
                  paddingLeft: 20,
                  margin: 0,
                }}>
                  {selectedPosting.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => alert(`Aplicar a: ${selectedPosting.title}`)}
                style={{
                  flex: 1,
                  padding: "14px 28px",
                  background: accentColor,
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Aplicar a esta posición
              </button>
              <button
                onClick={() => setSelectedPosting(null)}
                style={{
                  padding: "14px 28px",
                  background: "transparent",
                  color: "#737373",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}