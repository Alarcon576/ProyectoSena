import { useEffect, useState } from "react";
import "./Perfil.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";

function Perfil({ onSwitch }) {
  const [user, setUser] = useState(null);
  const [misPosts, setMisPosts] = useState([]);

const handleLogout = () => {
  localStorage.removeItem("token");
  onSwitch("login");
};
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUser(decoded);
      cargarMisPosts(decoded.id);
    }
  }, []);

  const cargarMisPosts = async (idUsuario) => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();

      const postsUsuario = data.filter(
        (post) => post.id_usuario === idUsuario
      );

      setMisPosts(postsUsuario);
    } catch (error) {
      console.error("Error cargando posts", error);
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      {/* HEADER PERFIL */}
      <div className="perfil-card">
        <div className="avatar">
          {user.nombre?.charAt(0).toUpperCase()}
        </div>

        <h2>{user.nombre}</h2>
        <p>{user.email}</p>

        <div className="perfil-stats">
          <div>
            <strong>{misPosts.length}</strong>
            <span>Posts</span>
          </div>

          <div>
            <strong>
              {misPosts.reduce(
                (acc, post) => acc + post.likes.length,
                0
              )}
            </strong>
            <span>Likes</span>
            <button className="btn-logout" onClick={handleLogout}>
  🚪 Cerrar sesión
</button>
          </div>
        </div>
      </div>

      {/* POSTS DEL USUARIO */}
      <div className="perfil-posts">
        <h3>Mis publicaciones</h3>

        {misPosts.map((post) => (
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

export default Perfil;