import { useEffect, useState } from "react";
import "./PerfilPublico.css";

const URL_POSTS =
  "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";

function PerfilPublico({ onSwitch, userId }) {
  const [user, setUser] = useState(null);
  const [postsUsuario, setPostsUsuario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) cargarPerfil();
  }, [userId]);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URL_PROFILE}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setUser(data);

      const resPosts = await fetch(URL_POSTS);
      const allPosts = await resPosts.json();
      const filtrados = allPosts.filter(
        (post) => post.id_usuario === data.id_usuario,
      );
      setPostsUsuario(filtrados);
    } catch (error) {
      console.error("Error perfil público:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalLikes = postsUsuario.reduce(
    (acc, post) => acc + (post.likes?.length || 0),
    0,
  );

  const totalComentarios = postsUsuario.reduce(
    (acc, post) => acc + (post.comentarios?.length || 0),
    0,
  );

  if (loading) {
    return (
      <div className="pp-loading">
        <div className="pp-spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pp-root">
      {/* NAVBAR */}
      <nav className="pp-navbar">
        <button className="pp-back-btn" onClick={() => onSwitch("feed")}>
          ← Volver
        </button>
        <span className="pp-navbar-brand">🐾 Street Paws</span>
        <div style={{ width: 80 }} />
      </nav>

      <div className="pp-container">
        {/* ── HERO / BANNER ── */}
        <div className="pp-banner">
          <div className="pp-banner-gradient" />
        </div>

        {/* ── CARD PRINCIPAL ── */}
        <div className="pp-card">
          <div className="pp-avatar-wrap">
            <div className="pp-avatar">
              {user.foto_perfil ? (
                <img
                  src={user.foto_perfil}
                  alt={user.nombre}
                  className="pp-avatar-img"
                />
              ) : (
                <span>{user.nombre?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="pp-info">
            <h1 className="pp-nombre">{user.nombre}</h1>
            <p className="pp-email">📧 {user.email}</p>
            {user.ubicacion && (
              <p className="pp-ubicacion">📍 {user.ubicacion}</p>
            )}
            {user.bio && <p className="pp-bio">{user.bio}</p>}
          </div>

          {/* Stats */}
          <div className="pp-stats">
            <div className="pp-stat">
              <strong>{postsUsuario.length}</strong>
              <span>Publicaciones</span>
            </div>
            <div className="pp-stat-divider" />
            <div className="pp-stat">
              <strong>{totalLikes}</strong>
              <span>Me gustas</span>
            </div>
            <div className="pp-stat-divider" />
            <div className="pp-stat">
              <strong>{totalComentarios}</strong>
              <span>Comentarios</span>
            </div>
          </div>

          <button className="pp-follow-btn">➕ Seguir</button>
        </div>

        {/* ── PUBLICACIONES ── */}
        <div className="pp-posts-section">
          <h2 className="pp-posts-title">
            Publicaciones de <span>{user.nombre}</span>
          </h2>

          {postsUsuario.length === 0 ? (
            <div className="pp-empty">
              <span>🐾</span>
              <p>Este usuario aún no tiene publicaciones</p>
            </div>
          ) : (
            <div className="pp-posts-grid">
              {postsUsuario.map((post) => (
                <article className="pp-post-card" key={post.id_publicacion}>
                  {post.imagenes?.[0] && (
                    <div className="pp-post-img-wrap">
                      <img
                        src={post.imagenes[0].url_imagen}
                        alt="publicación"
                        className="pp-post-img"
                      />
                    </div>
                  )}
                  <div className="pp-post-body">
                    {post.contenido_texto && (
                      <p className="pp-post-text">{post.contenido_texto}</p>
                    )}
                    <div className="pp-post-meta">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comentarios?.length || 0}</span>
                      <span className="pp-post-date">
                        {new Date(post.fecha_publicacion).toLocaleDateString(
                          "es-CO",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
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
