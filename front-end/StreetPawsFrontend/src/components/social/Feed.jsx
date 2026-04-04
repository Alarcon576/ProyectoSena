import { useEffect, useState } from "react";
import "./Feed.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_INTERACCIONES = "http://localhost:3000/api/interacciones";
const URL_PROFILE = "http://localhost:3000/api/profile";

function Feed({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  // Estados para edición
  const [editandoPost, setEditandoPost] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [imagenEditada, setImagenEditada] = useState(null);

  const token = localStorage.getItem("token");

  const cargarPosts = async () => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error cargando posts:", error);
    }
  };

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
      console.error("Error cargando usuario:", error);
    }
  };

  useEffect(() => {
    cargarPosts();
    cargarUsuarioActual();
  }, []);

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

    const data = await res.json();

    if (!res.ok) {
      alert(
        data.error ||
          "La publicación no cumple las normas de la comunidad"
      );
      return;
    }

    setContenido("");
    setImagen(null);
    cargarPosts();
  } catch (error) {
    console.error("Error creando publicación:", error);
    alert("Ocurrió un error al crear la publicación");
  } finally {
    setLoadingPost(false);
  }
};

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
      console.error("Error comentando:", error);
    }
  };

  const toggleComentarios = (id) => {
    setMostrarComentarios({
      ...mostrarComentarios,
      [id]: !mostrarComentarios[id]
    });
  };

  const iniciarEdicion = (post) => {
    setEditandoPost(post.id_publicacion);
    setTextoEditado(post.contenido_texto);
    setImagenEditada(null);
  };

  const guardarEdicion = async (id) => {
    try {
      const formData = new FormData();
      formData.append("contenido_texto", textoEditado);

      if (imagenEditada) {
        formData.append("imagen", imagenEditada);
      }

      await fetch(`${URL_POSTS}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      setEditandoPost(null);
      setTextoEditado("");
      setImagenEditada(null);
      cargarPosts();
    } catch (error) {
      console.error("Error editando:", error);
    }
  };

  const eliminarPost = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta publicación?"
    );

    if (!confirmar) return;

    try {
      await fetch(`${URL_POSTS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      cargarPosts();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  const postsFiltrados = posts.filter((post) =>
    post.usuario.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="feed-layout">
      <aside className="sidebar-left">
        <h2 className="brand">Street Paws</h2>

        <ul className="menu-list">
          <li onClick={() => onSwitch("feed")}>Noticias</li>
          <li onClick={() => onSwitch("perfil")}>Mi perfil</li>
        </ul>
      </aside>

      <main className="feed-main">
        <div className="search-users-box">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Crear post */}
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

        {/* Posts */}
        {postsFiltrados.map((post) => {
          const esMio =
            usuarioActual?.id_usuario === post.usuario.id_usuario;

          return (
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

                {esMio && (
                  <div className="post-owner-actions">
                    <button onClick={() => iniciarEdicion(post)}>
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        eliminarPost(post.id_publicacion)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {editandoPost === post.id_publicacion ? (
                <div className="edit-box">
                  <textarea
                    value={textoEditado}
                    onChange={(e) =>
                      setTextoEditado(e.target.value)
                    }
                  />

                  <label className="upload-btn">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        setImagenEditada(e.target.files[0])
                      }
                    />
                  </label>

                  {imagenEditada && (
                    <img
                      src={URL.createObjectURL(imagenEditada)}
                      alt="preview"
                      className="preview-image"
                    />
                  )}

                  <button
                    onClick={() =>
                      guardarEdicion(post.id_publicacion)
                    }
                  >
                    Guardar
                  </button>

                  <button
                    onClick={() => setEditandoPost(null)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <p className="post-text">
                    {post.contenido_texto}
                  </p>

                  {post.imagenes?.[0] && (
                    <img
                      src={post.imagenes[0].url_imagen}
                      alt="post"
                      className="post-image"
                    />
                  )}
                </>
              )}

              <div className="post-actions">
                <button
                  onClick={() =>
                    toggleLike(post.id_publicacion)
                  }
                >
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
                      value={
                        comentarios[post.id_publicacion] || ""
                      }
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
          );
        })}
      </main>

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