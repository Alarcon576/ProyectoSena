import { useEffect, useState } from "react";
import "./perfil.css";
import Navbar from "../Navbar/Navbar";

const URL_POSTS =
  "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";
const URL_SOLICITUDES =
  "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", color: "#b45309", bg: "#fef3c7" },
  aceptada: { label: "Aceptada", color: "#16a34a", bg: "#dcfce7" },
  rechazada: { label: "Rechazada", color: "#dc2626", bg: "#fee2e2" },
};

function Perfil({ onSwitch, userId }) {
  const [user, setUser] = useState(null);
  const [misPosts, setMisPosts] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [foto, setFoto] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tabActiva, setTabActiva] = useState("publicaciones");
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const esMiPerfil = !userId;
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPerfil();
  }, [userId]);

  useEffect(() => {
    if (!esMiPerfil) return;
    if (tabActiva === "adopciones") cargarSolicitudes();
  }, [tabActiva]);

  const cargarPerfil = async () => {
    try {
      const endpoint = esMiPerfil
        ? `${URL_PROFILE}/me`
        : `${URL_PROFILE}/${userId}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
      cargarMisPosts(data.id_usuario);
    } catch (err) {
      console.error("Error perfil:", err);
    }
  };

  const cargarMisPosts = async (idUsuario) => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();
      setMisPosts(data.filter((p) => p.id_usuario === idUsuario));
    } catch (err) {
      console.error("Error posts:", err);
    }
  };

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const res = await fetch(`${URL_SOLICITUDES}/mis-solicitudes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error solicitudes:", err);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const cancelarSolicitud = async (id) => {
    if (!window.confirm("¿Cancelar esta solicitud?")) return;
    try {
      await fetch(`${URL_SOLICITUDES}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarSolicitudes();
    } catch (err) {
      console.error("Error cancelando:", err);
    }
  };

  const subirFotoPerfil = async () => {
    if (!foto) return;
    const fd = new FormData();
    fd.append("foto", foto);
    try {
      const res = await fetch(`${URL_PROFILE}/foto`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setFoto(null);
        setMostrarModal(false);
        cargarPerfil();
      }
    } catch (err) {
      console.error("Error foto:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onSwitch("login");
  };

  if (!user) return <p className="loading">Cargando perfil...</p>;

  const totalLikes = misPosts.reduce((acc, p) => acc + p.likes.length, 0);
  const totalAdoptados = solicitudes.filter(
    (s) => s.estado?.toLowerCase() === "aceptada",
  ).length;

  return (
    <div
      style={{
        background: "var(--cream, #faf7f3)",
        minHeight: "100vh",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ── NAVBAR UNIFICADA ── */}
      <Navbar
        onSwitch={onSwitch}
        activeView="perfil"
        showNavActions={true}
        extraActions={[
          { label: "Feed", onClick: () => onSwitch("feed") },
          ...(esMiPerfil
            ? [
                {
                  label: "Salir",
                  onClick: handleLogout,
                  className: "nb-logout",
                },
              ]
            : []),
        ]}
      />

      {/* ── BANNER ── */}
      <div className="perfil-banner">
        <div className="perfil-banner-bg" />
      </div>

      <div className="perfil-container">
        {/* ── CARD PERFIL ── */}
        <div className="perfil-card">
          <div className="avatar-wrapper">
            <div className="avatar">
              {user?.foto_perfil ? (
                <img
                  src={user.foto_perfil}
                  alt="perfil"
                  className="avatar-preview"
                />
              ) : (
                user.nombre?.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <h2 className="perfil-nombre">{user.nombre}</h2>

          {user.descripcion ? (
            <p className="perfil-bio">{user.descripcion}</p>
          ) : esMiPerfil ? (
            <p className="perfil-bio perfil-bio--vacia">
              Aún no tienes descripción.{" "}
              <span
                style={{
                  color: "var(--orange, #ff7a00)",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                onClick={() => onSwitch("configuracion")}
              >
                Añadir una →
              </span>
            </p>
          ) : null}

          {esMiPerfil ? (
            <button
              className="btn-edit-profile"
              onClick={() => setMostrarModal(true)}
            >
              Editar perfil
            </button>
          ) : (
            <button className="btn-follow">Seguir</button>
          )}

          <div className="perfil-stats">
            <div className="stat-card">
              <strong>{misPosts.length}</strong>
              <span>POSTS</span>
            </div>
            <div className="stat-card">
              <strong>{totalAdoptados}</strong>
              <span>ADOPTADOS</span>
            </div>
            <div className="stat-card">
              <strong>{totalLikes}</strong>
              <span>LIKES</span>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="perfil-tabs">
          <button
            className={`perfil-tab ${tabActiva === "publicaciones" ? "perfil-tab--active" : ""}`}
            onClick={() => setTabActiva("publicaciones")}
          >
            📋 Mis Publicaciones
          </button>
          {esMiPerfil && (
            <button
              className={`perfil-tab ${tabActiva === "adopciones" ? "perfil-tab--active" : ""}`}
              onClick={() => setTabActiva("adopciones")}
            >
              🐾 Mis Adopciones
            </button>
          )}
        </div>

        <div className="perfil-tab-content">
          {/* ══ TAB: PUBLICACIONES ══ */}
          {tabActiva === "publicaciones" && (
            <div className="perfil-grid">
              {misPosts.length === 0 ? (
                <div className="perfil-empty" style={{ gridColumn: "1/-1" }}>
                  <span>📷</span>
                  <p>Aún no hay publicaciones</p>
                </div>
              ) : (
                <>
                  {misPosts.map((post) => (
                    <div className="perfil-grid-item" key={post.id_publicacion}>
                      {post.imagenes?.[0] ? (
                        <img src={post.imagenes[0].url_imagen} alt="post" />
                      ) : (
                        <div className="perfil-grid-text">
                          <p>{post.contenido_texto}</p>
                        </div>
                      )}
                      <div className="perfil-grid-overlay">
                        <span>❤️ {post.likes.length}</span>
                        <span>💬 {post.comentarios.length}</span>
                      </div>
                    </div>
                  ))}
                  <div
                    className="perfil-grid-item perfil-grid-new"
                    onClick={() => onSwitch("feed")}
                  >
                    <span>＋</span>
                    <p>Nueva Publicación</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ TAB: MIS ADOPCIONES ══ */}
          {tabActiva === "adopciones" && esMiPerfil && (
            <div className="perfil-adopciones">
              {loadingSolicitudes ? (
                <div className="perfil-empty">
                  <div className="adopt-spinner" />
                  <p>Cargando...</p>
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="perfil-empty">
                  <span>🐾</span>
                  <p>No tienes solicitudes de adopción aún</p>
                  <button onClick={() => onSwitch("adopciones")}>
                    Ver mascotas disponibles
                  </button>
                </div>
              ) : (
                solicitudes.map((sol) => {
                  const cfg = ESTADO_CONFIG[sol.estado?.toLowerCase()] || {
                    label: sol.estado,
                    color: "#888",
                    bg: "#f3f4f6",
                  };
                  return (
                    <div className="solicitud-card" key={sol.id_solicitud}>
                      <div className="solicitud-img">
                        {sol.mascota?.fotos?.[0]?.url_foto ? (
                          <img
                            src={sol.mascota.fotos[0].url_foto}
                            alt={sol.mascota.nombre}
                          />
                        ) : (
                          <span>🐾</span>
                        )}
                      </div>
                      <div className="solicitud-info">
                        <h4>{sol.mascota?.nombre || "Mascota"}</h4>
                        <p className="solicitud-meta">
                          {sol.mascota?.especie} · {sol.mascota?.raza}
                        </p>
                        {sol.notas && (
                          <p className="solicitud-notas">"{sol.notas}"</p>
                        )}
                        <p className="solicitud-fecha">
                          Solicitado el{" "}
                          {new Date(sol.fecha_solicitud).toLocaleDateString(
                            "es-CO",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="solicitud-right">
                        <span
                          className="solicitud-estado"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >
                          {cfg.label}
                        </span>
                        {sol.estado?.toLowerCase() === "pendiente" && (
                          <button
                            className="solicitud-cancelar"
                            onClick={() => cancelarSolicitud(sol.id_solicitud)}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL FOTO ── */}
      {esMiPerfil && mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar foto de perfil</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
            />
            {foto && (
              <img
                src={URL.createObjectURL(foto)}
                alt="preview"
                className="preview-modal"
              />
            )}
            <div className="modal-actions">
              <button onClick={subirFotoPerfil}>Guardar</button>
              <button
                className="btn-close"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;
