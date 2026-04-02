import { useEffect, useState } from "react";
import "./Perfil.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_PROFILE = "http://localhost:3000/api/profile";

function PerfilPublico({ onSwitch, userId }) {
  const [user, setUser] = useState(null);
  const [postsUsuario, setPostsUsuario] = useState([]);

  useEffect(() => {
    cargarPerfil();
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
      cargarPosts(data.id_usuario);
    } catch (error) {
      console.error("Error perfil público:", error);
    }
  };

  const cargarPosts = async (idUsuario) => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();

      const filtrados = data.filter(
        (post) => post.id_usuario === idUsuario
      );

      setPostsUsuario(filtrados);
    } catch (error) {
      console.error("Error posts usuario", error);
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      <button
        className="btn-back-feed"
        onClick={() => onSwitch("feed")}
      >
        ⬅️ Volver al feed
      </button>

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

        <h2>{user.nombre}</h2>
        <p>{user.email}</p>

        <button className="btn-follow">
          ➕ Seguir
        </button>

        <div className="perfil-stats">
          <div className="stat-card">
            <strong>{postsUsuario.length}</strong>
            <span>Posts</span>
          </div>

          <div className="stat-card">
            <strong>
              {postsUsuario.reduce(
                (acc, post) => acc + post.likes.length,
                0
              )}
            </strong>
            <span>Likes</span>
          </div>
        </div>
      </div>

      <div className="perfil-posts">
        <h3>Publicaciones</h3>

        {postsUsuario.map((post) => (
          <div className="perfil-post-card" key={post.id_publicacion}>
            <p>{post.contenido_texto}</p>

            {post.imagenes?.[0] && (
              <img
                src={post.imagenes[0].url_imagen}
                alt="post"
              />
            )}

            <small>
              ❤️ {post.likes.length} · 💬 {post.comentarios.length}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PerfilPublico;