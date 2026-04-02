import { useEffect, useState } from "react";
import "./Perfil.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_PROFILE = "http://localhost:3000/api/profile";

function Perfil({ onSwitch, userId }) {
  const [user, setUser] = useState(null);
  const [misPosts, setMisPosts] = useState([]);
  const [foto, setFoto] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const esMiPerfil = !userId;

  const handleLogout = () => {
    localStorage.removeItem("token");
    onSwitch("login");
  };

  useEffect(() => {
    cargarPerfil();
  }, [userId]);

  const cargarPerfil = async () => {
    try {
      const endpoint = esMiPerfil
        ? `${URL_PROFILE}/me`
        : `${URL_PROFILE}/${userId}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setUser(data);
      cargarMisPosts(data.id_usuario);
    } catch (error) {
      console.error("Error perfil:", error);
    }
  };

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

  const subirFotoPerfil = async () => {
    if (!foto) return;

    const formData = new FormData();
    formData.append("foto", foto);

    try {
      const res = await fetch(`${URL_PROFILE}/foto`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (res.ok) {
        setFoto(null);
        setMostrarModal(false);
        cargarPerfil();
      }
    } catch (error) {
      console.error("Error subiendo foto", error);
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      {/* 🚪 SOLO MI PERFIL */}
      {esMiPerfil && (
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      )}

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
        <p className="perfil-email">{user.email}</p>

        {/* ✏️ SOLO MI PERFIL */}
        {esMiPerfil && (
          <button
            className="btn-edit-profile"
            onClick={() => setMostrarModal(true)}
          >
            ✏️ Editar perfil
          </button>
        )}

        {/* 🚀 FUTURO BOTÓN SEGUIR */}
        {!esMiPerfil && (
          <button className="btn-follow">
            ➕ Seguir
          </button>
        )}

        <div className="perfil-stats">
          <div className="stat-card">
            <strong>{misPosts.length}</strong>
            <span>Posts</span>
          </div>

          <div className="stat-card">
            <strong>
              {misPosts.reduce(
                (acc, post) => acc + post.likes.length,
                0
              )}
            </strong>
            <span>Likes</span>
          </div>
        </div>
      </div>

      <div className="perfil-posts">
        <h3>
          {esMiPerfil
            ? "Mis publicaciones"
            : `Publicaciones de ${user.nombre}`}
        </h3>

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

      {/* 🪟 MODAL SOLO MI PERFIL */}
      {esMiPerfil && mostrarModal && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button onClick={subirFotoPerfil}>
                Guardar
              </button>

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