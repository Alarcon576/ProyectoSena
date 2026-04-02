import { useEffect, useState } from "react";
import "./Feed.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_INTERACCIONES = "http://localhost:3000/api/interacciones";
const URL_PROFILE = "http://localhost:3000/api/profile";

function Feed({ onSwitch }) {
  // Estado de publicaciones
  const [posts, setPosts] = useState([]);

  // Estado del formulario de publicación
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);

  // Estado de comentarios por publicación
  const [comentarios, setComentarios] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});

  // Usuario autenticado actual
  const [usuarioActual, setUsuarioActual] = useState(null);

  // Campo de búsqueda de usuarios
  const [busqueda, setBusqueda] = useState("");

  // Estado de carga mientras se crea un post
  const [loadingPost, setLoadingPost] = useState(false);

  const token = localStorage.getItem("token");

  /*
    Carga todas las publicaciones del feed
  */
  const cargarPosts = async () => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  };

  /*
    Obtiene la información del usuario autenticado
  */
  const cargarUsuarioActual = async () => {
    try {
      const res = await fetch(`${URL_PROFILE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setUsuarioActual(data);
    } catch (error) {
      console.error("Error cargando usuario actual:", error);
    }
  };

  /*
    Carga inicial del feed y del usuario
  */
  useEffect(() => {
    cargarPosts();
    cargarUsuarioActual();
  }, []);

  /*
    Crea una nueva publicación con texto e imagen opcional
  */
  const crearPost = async (e) => {
    e.preventDefault();

    if (!contenido.trim() && !imagen) return;

    setLoadingPost(true);

    try {
      const formData = new FormData();
      formData.append("contenido_texto", contenido);

      if (imagen) {
        formData.append("imagen", imagen);
      }

      const res = await fetch(URL_POSTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setContenido("");
        setImagen(null);
        cargarPosts();
      }
    } catch (error) {
      console.error("Error creando publicación:", error);
    } finally {
      setLoadingPost(false);
    }
  };

  /*
    Gestiona likes de una publicación
  */
  const toggleLike = async (id) => {
    try {
      await fetch(`${URL_INTERACCIONES}/like/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      cargarPosts();
    } catch (error) {
      console.error("Error dando like:", error);
    }
  };

  /*
    Crea comentario sobre una publicación
  */
  const crearComentario = async (id) => {
    const texto = comentarios[id];
    if (!texto?.trim()) return;

    try {
      await fetch(`${URL_INTERACCIONES}/comentario/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: texto })
      });

      setComentarios({
        ...comentarios,
        [id]: ""
      });

      cargarPosts();
    } catch (error) {
      console.error("Error creando comentario:", error);
    }
  };

  /*
    Muestra u oculta comentarios por publicación
  */
  const toggleComentarios = (id) => {
    setMostrarComentarios({
      ...mostrarComentarios,
      [id]: !mostrarComentarios[id]
    });
  };

  /*
    Filtrado dinámico por nombre de usuario
  */
  const postsFiltrados = posts.filter((post) =>
    post.usuario.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="feed-layout">
      {/* Sidebar izquierdo */}
      <aside className="sidebar-left">
        <h2 className="brand">Street Paws</h2>

        <ul className="menu-list">
          <li onClick={() => onSwitch("feed")}>Noticias</li>
          <li onClick={() => onSwitch("perfil")}>Mi perfil</li>
        </ul>

        <div className="tip-box">
          <h4>Tip del día</h4>
          <p>
            Compartir historias de rescate inspira a más personas a adoptar.
          </p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="feed-main">
        {/* Buscador */}
        <div className="search-users-box">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Formulario de creación */}
        <form className="crear-post-card" onSubmit={crearPost}>
          <div className="crear-post-header">
            <div className="avatar-mini">
              {usuarioActual?.foto_perfil ? (
                <img
                  src={usuarioActual.foto_perfil}
                  alt={usuarioActual.nombre}
                  className="avatar-feed-img"
                />
              ) : (
                usuarioActual?.nombre?.charAt(0) || "U"
              )}
            </div>

            <textarea
              placeholder="¿Qué historia quieres compartir hoy?"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>

          <div className="crear-post-footer">
            <label className="upload-btn">
              Foto
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImagen(e.target.files[0])}
              />
            </label>

            <button type="submit" disabled={loadingPost}>
              {loadingPost ? (
                <span className="spinner"></span>
              ) : (
                "Publicar"
              )}
            </button>
          </div>

          {imagen && (
            <div className="preview-box">
              <img
                src={URL.createObjectURL(imagen)}
                alt="preview"
                className="preview-image"
              />
            </div>
          )}
        </form>

        {/* Publicaciones */}
        {postsFiltrados.map((post) => (
          <div className="post-card" key={post.id_publicacion}>
            <div className="post-header">
              <div className="post-user">
                <div className="avatar-mini">
                  {post.usuario?.foto_perfil ? (
                    <img
                      src={post.usuario.foto_perfil}
                      alt={post.usuario.nombre}
                      className="avatar-feed-img"
                    />
                  ) : (
                    post.usuario.nombre?.charAt(0)
                  )}
                </div>

                <div className="post-user-info">
                  <h4
                    className="clickable-user"
                    onClick={() =>
                      onSwitch(
                        "perfilPublico",
                        post.usuario.id_usuario
                      )
                    }
                  >
                    {post.usuario.nombre}
                  </h4>

                  <span>
                    {new Date(
                      post.fecha_publicacion
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="post-text">{post.contenido_texto}</p>

            {post.imagenes?.[0] && (
              <img
                src={post.imagenes[0].url_imagen}
                alt="post"
                className="post-image"
              />
            )}

            <div className="post-actions">
              <button onClick={() => toggleLike(post.id_publicacion)}>
                ❤️ {post.likes.length}
              </button>

              <button
                onClick={() =>
                  toggleComentarios(post.id_publicacion)
                }
              >
                💬 {post.comentarios.length}
              </button>
            </div>

            {mostrarComentarios[post.id_publicacion] && (
              <div className="comentarios-dropdown">
                <h4>Comentarios</h4>

                {post.comentarios.map((c) => (
                  <p key={c.id_comentario}>
                    <strong>{c.usuario.nombre}: </strong>
                    {c.contenido}
                  </p>
                ))}

                <div className="comentario-box-modern">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={comentarios[post.id_publicacion] || ""}
                    onChange={(e) =>
                      setComentarios({
                        ...comentarios,
                        [post.id_publicacion]:
                          e.target.value
                      })
                    }
                  />

                  <button
                    onClick={() =>
                      crearComentario(post.id_publicacion)
                    }
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Sidebar derecho */}
      <aside className="sidebar-right">
        <div className="widget-card">
          <h3>Tendencias</h3>
          <p>#AdoptaNoCompres</p>
          <p>#HistoriasDeRescate</p>
          <p>#StreetPaws</p>
        </div>
      </aside>
    </div>
  );
}

export default Feed;