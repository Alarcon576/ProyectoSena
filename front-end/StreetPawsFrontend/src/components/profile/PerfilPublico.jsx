import { useEffect, useState } from "react";
import "./Perfil.css";

const URL_POSTS = "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_PROFILE = "https://proyectosena-production-4ad5.up.railway.app/api/profile";

function PerfilPublico({ onSwitch, userId }) {
  const [user, setUser] = useState(null);
  const [postsUsuario, setPostsUsuario] = useState([]);

  useEffect(() => {
    if (userId) {
      cargarPerfil();
    }
  }, [userId]);

  const cargarPerfil = async () => {
    try {
      const res = await fetch(`${URL_PROFILE}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setUser(data);

      const resPosts = await fetch(URL_POSTS);
      const allPosts = await resPosts.json();

      const filtrados = allPosts.filter(
        (post) => post.id_usuario === data.id_usuario
      );

      setPostsUsuario(filtrados);
    } catch (error) {
      console.error("Error perfil público:", error);
    }
  };

  const totalLikes = postsUsuario.reduce(
    (acc, post) => acc + (post.likes?.length || 0),
    0
  );

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      {/* NAVBAR PREMIUM */}
      <nav className="perfil-navbar">
        <h2
          className="brand"
          onClick={() => onSwitch("feed")}
        >
          Street Paws
        </h2>

        <div className="perfil-nav-actions">
          <button onClick={() => onSwitch("feed")}>
            ← Feed
          </button>
        </div>
      </nav>

      {/* CARD PERFIL */}
      <div className="perfil-card">
        <div className="avatar-wrapper">
          <div className="avatar">
            {user?.foto_perfil ? (
              <img
                src={user.foto_perfil}
                alt={user.nombre}
                className="avatar-preview"
              />
            ) : (
              user.nombre?.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <h2 className="perfil-nombre">{user.nombre}</h2>
        <p className="perfil-email">{user.email}</p>

        <button className="btn-follow">
          Seguir
        </button>

        <div className="perfil-stats">
          <div className="stat-card">
            <strong>{postsUsuario.length}</strong>
            <span>Posts</span>
          </div>

          <div className="stat-card">
            <strong>{totalLikes}</strong>
            <span>Likes</span>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="perfil-posts">
        <h3>Publicaciones de {user.nombre}</h3>

        {postsUsuario.length === 0 ? (
          <p className="sin-posts">
            Este usuario no tiene publicaciones
          </p>
        ) : (
          postsUsuario.map((post) => (
            <div
              className="perfil-post-card"
              key={post.id_publicacion}
            >
              <p>{post.contenido_texto}</p>

              {post.imagenes?.[0] && (
                <img
                  src={post.imagenes[0].url_imagen}
                  alt="post"
                />
              )}

              <small>
                ❤️ {post.likes.length} · 💬{" "}
                {post.comentarios.length}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PerfilPublico;