import { useEffect, useState } from "react";
import "./PerfilPublico.css";

const URL_POSTS   = "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_PROFILE = "https://proyectosena-production-4ad5.up.railway.app/api/profile";

function PerfilPublico({ onSwitch, userId }) {
  const [user, setUser]                 = useState(null);
  const [postsUsuario, setPostsUsuario] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { if (userId) cargarPerfil(); }, [userId]);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${URL_PROFILE}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setUser(data);

      const resPosts = await fetch(URL_POSTS);
      const allPosts = await resPosts.json();
      setPostsUsuario(allPosts.filter(p => p.id_usuario === data.id_usuario));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalLikes      = postsUsuario.reduce((a, p) => a + (p.likes?.length || 0), 0);
  const totalComentarios = postsUsuario.reduce((a, p) => a + (p.comentarios?.length || 0), 0);

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <p>Cargando perfil…</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="pp-root">
      {/* ── Navbar ── */}
      <nav className="pp-navbar">
        <button className="pp-back-btn" onClick={() => onSwitch("feed")}>← Volver</button>
        <span className="pp-navbar-brand">Street Paws</span>
        <div className="pp-navbar-spacer" />
      </nav>

      {/* ── Banner crema/naranja ── */}
      <div className="pp-banner">
        <div className="pp-banner-bg" />
      </div>

      <div className="pp-container">
        {/* ── Card perfil ── */}
        <div className="pp-profile-card">

          {/* Avatar superpuesto al banner */}
          <div className="pp-avatar-wrap">
            <div className="pp-avatar">
              {user.foto_perfil
                ? <img src={user.foto_perfil} alt={user.nombre} className="pp-avatar-img" />
                : <span>{user.nombre?.charAt(0)?.toUpperCase()}</span>}
            </div>
          </div>

          {/* Info principal */}
          <div className="pp-profile-body">
            {/* Columna izq: nombre + datos */}
            <div className="pp-profile-info">
              <h1 className="pp-nombre">{user.nombre}</h1>
              {user.email && (
                <p className="pp-dato"><span className="pp-dato-icon">✉</span>{user.email}</p>
              )}
              {user.ubicacion && (
                <p className="pp-dato"><span className="pp-dato-icon">📍</span>{user.ubicacion}</p>
              )}
              {user.bio && <p className="pp-bio">{user.bio}</p>}
            </div>

            {/* Columna der: stats */}
            <div className="pp-stats-row">
              <div className="pp-stat-block">
                <strong>{postsUsuario.length}</strong>
                <span>Publicaciones</span>
              </div>
              <div className="pp-stat-sep" />
              <div className="pp-stat-block">
                <strong>{totalLikes}</strong>
                <span>Me gustas</span>
              </div>
              <div className="pp-stat-sep" />
              <div className="pp-stat-block">
                <strong>{totalComentarios}</strong>
                <span>Comentarios</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sección publicaciones ── */}
        <div className="pp-posts-section">
          <div className="pp-posts-header">
            <h2 className="pp-posts-title">
              <span className="pp-posts-icon">📸</span>
              Publicaciones de <em>{user.nombre}</em>
            </h2>
            <span className="pp-posts-count">{postsUsuario.length}</span>
          </div>

          {postsUsuario.length === 0 ? (
            <div className="pp-empty">
              <span>🐾</span>
              <p>Este usuario aún no tiene publicaciones</p>
            </div>
          ) : (
            <div className="pp-posts-grid">
              {postsUsuario.map(post => (
                <article className="pp-post-card" key={post.id_publicacion}>
                  {post.imagenes?.[0] && (
                    <div className="pp-post-img-wrap">
                      <img src={post.imagenes[0].url_imagen} alt="publicación" className="pp-post-img" />
                    </div>
                  )}
                  <div className="pp-post-body">
                    {post.contenido_texto && (
                      <p className="pp-post-text">{post.contenido_texto}</p>
                    )}
                    <div className="pp-post-footer">
                      <div className="pp-post-meta">
                        <span>❤️ {post.likes?.length || 0}</span>
                        <span>💬 {post.comentarios?.length || 0}</span>
                      </div>
                      <span className="pp-post-date">
                        {new Date(post.fecha_publicacion).toLocaleDateString("es-CO", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default PerfilPublico;