import { useEffect, useState } from "react";
import "./Perfil.css";

const URL_POSTS       = "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_PROFILE     = "https://proyectosena-production-4ad5.up.railway.app/api/profile";
const URL_SOLICITUDES = "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";
const URL_FAVORITOS   = "https://proyectosena-production-4ad5.up.railway.app/api/favoritos";

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", color: "#b45309", bg: "#fef3c7" },
  aprobada:  { label: "Aprobada",  color: "#16a34a", bg: "#dcfce7" },
  rechazada: { label: "Rechazada", color: "#dc2626", bg: "#fee2e2" },
};

function Perfil({ onSwitch, userId }) {
  const [user, setUser]               = useState(null);
  const [misPosts, setMisPosts]       = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [favoritos, setFavoritos]     = useState([]);
  const [foto, setFoto]               = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tabActiva, setTabActiva]     = useState("publicaciones");
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [loadingFavoritos, setLoadingFavoritos]     = useState(false);

  const esMiPerfil = !userId;
  const token      = localStorage.getItem("token");

  useEffect(() => { cargarPerfil(); }, [userId]);

  useEffect(() => {
    if (!esMiPerfil) return;
    if (tabActiva === "adopciones") cargarSolicitudes();
    if (tabActiva === "favoritos")  cargarFavoritos();
  }, [tabActiva]);

  const cargarPerfil = async () => {
    try {
      const endpoint = esMiPerfil ? `${URL_PROFILE}/me` : `${URL_PROFILE}/${userId}`;
      const res  = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUser(data);
      cargarMisPosts(data.id_usuario);
    } catch (err) { console.error("Error perfil:", err); }
  };

  const cargarMisPosts = async (idUsuario) => {
    try {
      const res  = await fetch(URL_POSTS);
      const data = await res.json();
      setMisPosts(data.filter((p) => p.id_usuario === idUsuario));
    } catch (err) { console.error("Error posts:", err); }
  };

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const res  = await fetch(`${URL_SOLICITUDES}/mis-solicitudes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error solicitudes:", err); setSolicitudes([]); }
    finally { setLoadingSolicitudes(false); }
  };

  const cargarFavoritos = async () => {
    setLoadingFavoritos(true);
    try {
      const res  = await fetch(URL_FAVORITOS, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFavoritos(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error favoritos:", err); setFavoritos([]); }
    finally { setLoadingFavoritos(false); }
  };

  const quitarFavorito = async (id_mascota) => {
    try {
      await fetch(`${URL_FAVORITOS}/${id_mascota}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritos((prev) => prev.filter((f) => f.id_mascota !== id_mascota));
    } catch (err) { console.error("Error quitando favorito:", err); }
  };

  const cancelarSolicitud = async (id) => {
    if (!window.confirm("¿Cancelar esta solicitud?")) return;
    try {
      await fetch(`${URL_SOLICITUDES}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      cargarSolicitudes();
    } catch (err) { console.error("Error cancelando:", err); }
  };

  const subirFotoPerfil = async () => {
    if (!foto) return;
    const fd = new FormData();
    fd.append("foto", foto);
    try {
      const res = await fetch(`${URL_PROFILE}/foto`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) { setFoto(null); setMostrarModal(false); cargarPerfil(); }
    } catch (err) { console.error("Error foto:", err); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); onSwitch("login"); };

  const getEdadTexto = (edad) => {
    if (!edad && edad !== 0) return "";
    if (edad === 0) return "Menos de 1 año";
    return `${edad} año${edad !== 1 ? "s" : ""}`;
  };

  if (!user) return <p className="loading">Cargando perfil...</p>;

  const totalLikes     = misPosts.reduce((acc, p) => acc + p.likes.length, 0);
  const totalAdoptados = solicitudes.filter((s) => s.estado?.toLowerCase() === "aprobada").length;

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="perfil-navbar">
        <div className="perfil-logo" onClick={() => onSwitch("feed")}>Street Paws</div>
        <div className="perfil-nav-links">
          <span onClick={() => onSwitch("feed")}>Inicio</span>
          <span onClick={() => onSwitch("explorar")}>Explorar</span>
          <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
        </div>
        <div className="perfil-nav-actions">
          <button onClick={() => onSwitch("feed")}>Feed</button>
          {esMiPerfil && <button className="logout-btn" onClick={handleLogout}>Salir</button>}
        </div>
      </nav>

      <div className="perfil-container">

        {/* ── CARD PERFIL ── */}
        <div className="perfil-card">
          <div className="avatar-wrapper">
            <div className="avatar">
              {user?.foto_perfil
                ? <img src={user.foto_perfil} alt="perfil" className="avatar-preview" />
                : user.nombre?.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="perfil-nombre">{user.nombre}</h2>
          <p className="perfil-ubicacion">📍 Mi casa</p>
          <p className="perfil-bio">
            Amante de los animales y rescatista voluntario.<br />
            Comprometido con encontrar el hogar perfecto para cada pelucito callejero.
          </p>
          {esMiPerfil
            ? <button className="btn-edit-profile" onClick={() => setMostrarModal(true)}>Editar perfil</button>
            : <button className="btn-follow">Seguir</button>}
          <div className="perfil-stats">
            <div className="stat-card"><strong>{misPosts.length}</strong><span>POSTS</span></div>
            <div className="stat-card"><strong>{totalAdoptados}</strong><span>ADOPTADOS</span></div>
            <div className="stat-card"><strong>{totalLikes}</strong><span>FAVORITOS</span></div>
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
            <>
              <button
                className={`perfil-tab ${tabActiva === "adopciones" ? "perfil-tab--active" : ""}`}
                onClick={() => setTabActiva("adopciones")}
              >
                🐾 Mis Adopciones
              </button>
              <button
                className={`perfil-tab ${tabActiva === "favoritos" ? "perfil-tab--active" : ""}`}
                onClick={() => setTabActiva("favoritos")}
              >
                ❤️ Favoritos
              </button>
            </>
          )}
        </div>

        {/* ══ TAB: PUBLICACIONES ══ */}
        {tabActiva === "publicaciones" && (
          <div className="perfil-grid">
            {misPosts.length === 0 ? (
              <div className="perfil-empty" style={{ gridColumn: "1/-1" }}>
                <span>📷</span><p>Aún no hay publicaciones</p>
              </div>
            ) : (
              <>
                {misPosts.map((post) => (
                  <div className="perfil-grid-item" key={post.id_publicacion}>
                    {post.imagenes?.[0]
                      ? <img src={post.imagenes[0].url_imagen} alt="post" />
                      : <div className="perfil-grid-text"><p>{post.contenido_texto}</p></div>}
                    <div className="perfil-grid-overlay">
                      <span>❤️ {post.likes.length}</span>
                      <span>💬 {post.comentarios.length}</span>
                    </div>
                  </div>
                ))}
                <div className="perfil-grid-item perfil-grid-new" onClick={() => onSwitch("feed")}>
                  <span>＋</span><p>Nueva Publicación</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ TAB: MIS ADOPCIONES (solicitudes) ══ */}
        {tabActiva === "adopciones" && esMiPerfil && (
          <div className="perfil-adopciones">
            {loadingSolicitudes ? (
              <div className="perfil-empty"><div className="adopt-spinner" /><p>Cargando...</p></div>
            ) : solicitudes.length === 0 ? (
              <div className="perfil-empty">
                <span>🐾</span>
                <p>No tienes solicitudes de adopción aún</p>
                <button onClick={() => onSwitch("adopciones")}>Ver mascotas disponibles</button>
              </div>
            ) : (
              solicitudes.map((sol) => {
                const cfg = ESTADO_CONFIG[sol.estado?.toLowerCase()] || { label: sol.estado, color: "#888", bg: "#f3f4f6" };
                return (
                  <div className="solicitud-card" key={sol.id_solicitud}>
                    <div className="solicitud-img">
                      {sol.mascota?.fotos?.[0]?.url_foto
                        ? <img src={sol.mascota.fotos[0].url_foto} alt={sol.mascota.nombre} />
                        : <span>🐾</span>}
                    </div>
                    <div className="solicitud-info">
                      <h4>{sol.mascota?.nombre || "Mascota"}</h4>
                      <p className="solicitud-meta">{sol.mascota?.especie} · {sol.mascota?.raza}</p>
                      {sol.notas && <p className="solicitud-notas">"{sol.notas}"</p>}
                      <p className="solicitud-fecha">
                        Solicitado el {new Date(sol.fecha_solicitud).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="solicitud-right">
                      <span className="solicitud-estado" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      {sol.estado?.toLowerCase() === "pendiente" && (
                        <button className="solicitud-cancelar" onClick={() => cancelarSolicitud(sol.id_solicitud)}>Cancelar</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ TAB: FAVORITOS ══ */}
        {tabActiva === "favoritos" && esMiPerfil && (
          <div className="perfil-favoritos">
            {loadingFavoritos ? (
              <div className="perfil-empty"><div className="adopt-spinner" /><p>Cargando...</p></div>
            ) : favoritos.length === 0 ? (
              <div className="perfil-empty">
                <span>🤍</span>
                <p>Aún no tienes mascotas en favoritos</p>
                <button onClick={() => onSwitch("adopciones")}>Explorar mascotas</button>
              </div>
            ) : (
              <div className="favoritos-grid">
                {favoritos.map(({ id_mascota, mascota }) => {
                  const disponible = mascota?.estado_adopcion?.toLowerCase() === "disponible";
                  return (
                    <div className="favorito-card" key={id_mascota}>
                      <div className="favorito-img">
                        {mascota?.fotos?.[0]?.url_foto
                          ? <img src={mascota.fotos[0].url_foto} alt={mascota.nombre} />
                          : <span>🐾</span>}
                        {/* Botón quitar favorito */}
                        <button
                          className="favorito-remove"
                          onClick={() => quitarFavorito(id_mascota)}
                          title="Quitar de favoritos"
                        >
                          ❤️
                        </button>
                        <span className={`fav-badge ${disponible ? "fav-badge--disponible" : "fav-badge--no"}`}>
                          {mascota?.estado_adopcion}
                        </span>
                      </div>
                      <div className="favorito-body">
                        <h4>{mascota?.nombre}</h4>
                        <p>{getEdadTexto(mascota?.edad)} · {mascota?.raza}</p>
                        <button
                          className={`btn-adoptar-fav ${!disponible ? "btn-adoptar-fav--disabled" : ""}`}
                          disabled={!disponible}
                          onClick={() => disponible && onSwitch("adopciones")}
                        >
                          {disponible ? "Adoptar" : "No disponible"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL FOTO ── */}
      {esMiPerfil && mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editar foto de perfil</h3>
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
            {foto && <img src={URL.createObjectURL(foto)} alt="preview" className="preview-modal" />}
            <div className="modal-actions">
              <button onClick={subirFotoPerfil}>Guardar</button>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Perfil;