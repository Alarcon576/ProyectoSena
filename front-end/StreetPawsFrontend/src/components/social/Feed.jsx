import { useEffect, useRef, useState } from "react";
import "./Feed.css";
 
const URL_POSTS         = "http://localhost:3000/api/publicaciones";
const URL_INTERACCIONES = "http://localhost:3000/api/interacciones";
const URL_PROFILE       = "http://localhost:3000/api/profile";
 
function Feed({ onSwitch }) {
  const [posts, setPosts]                           = useState([]);
  const [contenido, setContenido]                   = useState("");
  const [imagen, setImagen]                         = useState(null);
  const [comentarios, setComentarios]               = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  const [usuarioActual, setUsuarioActual]           = useState(null);
  const [busqueda, setBusqueda]                     = useState("");
  const [loadingPost, setLoadingPost]               = useState(false);
 
  // Modal edición post
  const [modalEditPost, setModalEditPost]   = useState(null);
  const [textoEditado, setTextoEditado]     = useState("");
  const [imagenEditada, setImagenEditada]   = useState(null);
  const [loadingEdit, setLoadingEdit]       = useState(false);
 
  // Edición comentarios
  const [editandoComentario, setEditandoComentario]         = useState(null);
  const [textoComentarioEditado, setTextoComentarioEditado] = useState("");
  const [loadingComentario, setLoadingComentario]           = useState(false);
 
  // Menús
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [menuPostAbierto, setMenuPostAbierto]     = useState(null);
 
  // Ref para input de imagen del crear-post
  const inputImagenRef = useRef(null);
 
  const token = localStorage.getItem("token");
 
  /* ── Cerrar menús al click fuera ── */
  useEffect(() => {
    const cerrar = () => { setMenuAvatarAbierto(false); setMenuPostAbierto(null); };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);
 
  /* ── Cerrar modal con Escape ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setModalEditPost(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
 
  /* ════ DATA ════ */
  const cargarPosts = async () => {
    try {
      const res  = await fetch(URL_POSTS);
      const data = await res.json();
      setPosts(data);
    } catch (err) { console.error("Error cargando posts:", err); }
  };
 
  const cargarUsuarioActual = async () => {
    try {
      const res  = await fetch(`${URL_PROFILE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsuarioActual(data);
    } catch (err) { console.error("Error cargando usuario:", err); }
  };
 
  useEffect(() => { cargarPosts(); cargarUsuarioActual(); }, []);
 
  /* ════ CREAR POST ════ */
  const crearPost = async (e) => {
    e.preventDefault();
    if (!contenido.trim() && !imagen) return;
    setLoadingPost(true);
    try {
      const fd = new FormData();
      fd.append("contenido_texto", contenido);
      if (imagen) fd.append("imagen", imagen);
 
      const res  = await fetch(URL_POSTS, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "La publicación no cumple las normas de la comunidad");
        return;
      }
      setContenido("");
      setImagen(null);
      if (inputImagenRef.current) inputImagenRef.current.value = "";
      await cargarPosts();
    } catch (err) {
      console.error("Error creando publicación:", err);
      alert("Ocurrió un error al crear la publicación");
    } finally { setLoadingPost(false); }
  };
 
  const quitarImagenNueva = () => {
    setImagen(null);
    if (inputImagenRef.current) inputImagenRef.current.value = "";
  };
 
  /* ════ LIKE ════ */
  const toggleLike = async (id) => {
    try {
      await fetch(`${URL_INTERACCIONES}/like/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarPosts();
    } catch (err) { console.error("Error dando like:", err); }
  };
 
  const yaDioLike = (post) =>
    post.likes?.some((l) => l.id_usuario === usuarioActual?.id_usuario);
 
  /* ════ COMENTARIOS ════ */
  const crearComentario = async (idPost) => {
    const texto = comentarios[idPost];
    if (!texto?.trim()) return;
    try {
      const res = await fetch(`${URL_INTERACCIONES}/comentario/${idPost}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: texto })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al comentar");
        return;
      }
      setComentarios((prev) => ({ ...prev, [idPost]: "" }));
      await cargarPosts();
    } catch (err) { console.error("Error comentando:", err); }
  };
 
  const eliminarComentario = async (idComentario) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      const res = await fetch(`${URL_INTERACCIONES}/comentario/${idComentario}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo eliminar el comentario");
        return;
      }
      await cargarPosts();
    } catch (err) { console.error("Error eliminando comentario:", err); }
  };
 
  const iniciarEdicionComentario = (c) => {
    setEditandoComentario(c.id_comentario);
    setTextoComentarioEditado(c.contenido);
  };
 
  const guardarEdicionComentario = async (idComentario) => {
    if (!textoComentarioEditado.trim()) return;
    setLoadingComentario(true);
    try {
      const res = await fetch(`${URL_INTERACCIONES}/comentario/${idComentario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: textoComentarioEditado })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo editar el comentario");
        return;
      }
      setEditandoComentario(null);
      setTextoComentarioEditado("");
      await cargarPosts();
    } catch (err) { console.error("Error editando comentario:", err); }
    finally { setLoadingComentario(false); }
  };
 
  const toggleComentarios = (id) =>
    setMostrarComentarios((prev) => ({ ...prev, [id]: !prev[id] }));
 
  /* ════ EDITAR POST (modal) ════ */
  const abrirModalEdicion = (post) => {
    setModalEditPost(post);
    setTextoEditado(post.contenido_texto || "");
    setImagenEditada(null);
  };
 
  const guardarEdicion = async () => {
    if (!modalEditPost) return;
    if (!textoEditado.trim() && !imagenEditada && !modalEditPost.imagenes?.[0]) {
      alert("La publicación no puede quedar vacía");
      return;
    }
    setLoadingEdit(true);
    try {
      const fd = new FormData();
      fd.append("contenido_texto", textoEditado);
      if (imagenEditada) fd.append("imagen", imagenEditada);
 
      const res = await fetch(`${URL_POSTS}/${modalEditPost.id_publicacion}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
 
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo guardar la edición");
        return;
      }
      setModalEditPost(null);
      setImagenEditada(null);
      await cargarPosts();
    } catch (err) {
      console.error("Error editando post:", err);
      alert("Error de conexión al guardar");
    } finally { setLoadingEdit(false); }
  };
 
  /* ════ ELIMINAR POST ════ */
  const eliminarPost = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;
    try {
      const res = await fetch(`${URL_POSTS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { alert("No se pudo eliminar la publicación"); return; }
      await cargarPosts();
    } catch (err) { console.error("Error eliminando:", err); }
  };
 
  const postsFiltrados = posts.filter((p) =>
    p.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
 

  return (
    <>
      {/* ══ MODAL EDICIÓN DE POST ══ */}
      {modalEditPost && (
        <div className="modal-overlay" onClick={() => setModalEditPost(null)}>
          <div className="modal-edit-post" onClick={(e) => e.stopPropagation()}>
 
            <div className="modal-edit-header">
              <h2>Editar publicación</h2>
              <button className="modal-close-btn" onClick={() => setModalEditPost(null)}>✕</button>
            </div>
 
            <div className="modal-edit-user">
              <div className="avatar-mini">
                {usuarioActual?.foto_perfil
                  ? <img src={usuarioActual.foto_perfil} alt="" className="avatar-feed-img" />
                  : usuarioActual?.nombre?.charAt(0) || "U"}
              </div>
              <div>
                <strong>{usuarioActual?.nombre}</strong>
                <span className="modal-edit-hint">Editando tu publicación</span>
              </div>
            </div>
 
            <textarea
              className="modal-edit-textarea"
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              placeholder="¿Qué quieres compartir?"
              rows={5}
            />
 
            {/* Preview imagen actual (si no hay nueva seleccionada) */}
            {!imagenEditada && modalEditPost.imagenes?.[0] && (
              <div className="modal-edit-img-preview">
                <img src={modalEditPost.imagenes[0].url_imagen} alt="actual" />
                <span className="modal-edit-img-label">Imagen actual</span>
              </div>
            )}
 
            {/* Preview nueva imagen */}
            {imagenEditada && (
              <div className="modal-edit-img-preview">
                <img src={URL.createObjectURL(imagenEditada)} alt="nueva" />
                <button
                  className="modal-edit-remove-img"
                  onClick={() => setImagenEditada(null)}
                >
                  ✕ Quitar
                </button>
              </div>
            )}
 
            <div className="modal-edit-footer">
              <label className="upload-btn">
                📷 Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setImagenEditada(e.target.files[0]);
                  }}
                />
              </label>
              <div className="modal-edit-actions">
                <button className="btn-cancelar" onClick={() => setModalEditPost(null)}>
                  Cancelar
                </button>
                <button className="btn-guardar" onClick={guardarEdicion} disabled={loadingEdit}>
                  {loadingEdit ? <span className="spinner" /> : "Guardar cambios"}
                </button>
              </div>
            </div>
 
          </div>
        </div>
      )}
 
      {/* ══ TOP NAVBAR ══ */}
      <nav className="top-navbar">
        <div className="nav-brand">Street Paws</div>
 
        <div className="nav-links">
          <span className="active" onClick={() => onSwitch("feed")}>Inicio</span>
          <span onClick={() => onSwitch("explorar")}>Explorar</span>
          <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
        </div>
 
        <div className="nav-search">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div
            className="nav-avatar-wrapper"
            onClick={(e) => { e.stopPropagation(); setMenuAvatarAbierto((v) => !v); }}
          >
            <div className="nav-avatar">
              {usuarioActual?.foto_perfil
                ? <img src={usuarioActual.foto_perfil} alt={usuarioActual.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : usuarioActual?.nombre?.charAt(0) || "U"}
            </div>
            {menuAvatarAbierto && (
              <div className="dropdown-avatar">
                <div className="dropdown-avatar-header">
                  <span className="dropdown-avatar-nombre">{usuarioActual?.nombre || "Usuario"}</span>
                  <span className="dropdown-avatar-email">{usuarioActual?.email || ""}</span>
                </div>
                <div className="dropdown-avatar-divider" />
                <button onClick={(e) => { e.stopPropagation(); setMenuAvatarAbierto(false); onSwitch("perfil"); }}>
                  👤 Mi perfil
                </button>
                <button onClick={(e) => { e.stopPropagation(); setMenuAvatarAbierto(false); onSwitch("configuracion"); }}>
                  ⚙️ Configuración
                </button>
                <div className="dropdown-avatar-divider" />
                <button
                  className="dropdown-avatar-logout"
                  onClick={(e) => { e.stopPropagation(); localStorage.removeItem("token"); onSwitch("login"); }}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
 
      {/* ══ LAYOUT ══ */}
      <div className="feed-layout">
 
        {/* SIDEBAR IZQUIERDO */}
        <aside className="sidebar-left">
          <ul className="menu-list">
            <li onClick={() => onSwitch("feed")}>Noticias</li>
            <li>Mis Adopciones</li>
          </ul>
          <div className="tip-box">
            <h4>💡 Tip del día</h4>
            <p>¿Sabías que el contacto visual con tu mascota libera oxitocina tanto en ti como en él?</p>
          </div>
        </aside>
 
        {/* FEED CENTRAL */}
        <main className="feed-main">
 
          {/* ── Crear post ── */}
          <form className="crear-post-card" onSubmit={crearPost}>
            <div className="crear-post-header">
              <div className="avatar-mini">
                {usuarioActual?.foto_perfil
                  ? <img src={usuarioActual.foto_perfil} alt={usuarioActual.nombre} className="avatar-feed-img" />
                  : usuarioActual?.nombre?.charAt(0) || "U"}
              </div>
              <textarea
                placeholder="¿Tienes alguna historia o mascota que compartir?"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
              />
            </div>
 
            {/* Preview imagen con botón eliminar */}
            {imagen && (
              <div className="crear-post-img-preview">
                <img src={URL.createObjectURL(imagen)} alt="preview" className="preview-image" />
                <button
                  type="button"
                  className="btn-quitar-imagen"
                  onClick={quitarImagenNueva}
                  title="Quitar imagen"
                >
                  ✕
                </button>
              </div>
            )}
 
            <div className="crear-post-footer">
              <label className="upload-btn">
                 Foto
                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { if (e.target.files[0]) setImagen(e.target.files[0]); }}
                />
              </label>
              <button type="submit" disabled={loadingPost}>
                {loadingPost ? <span className="spinner" /> : "Publicar"}
              </button>
            </div>
          </form>
 
          {/* ── Posts ── */}
          {postsFiltrados.map((post) => {
            const esMio   = usuarioActual?.id_usuario === post.usuario.id_usuario;
            const likeado = yaDioLike(post);
 
            return (
              <div className="post-card" key={post.id_publicacion}>
 
                {/* Header */}
                <div className="post-header">
                  <div className="post-user">
                    <div className="avatar-mini">
                      {post.usuario?.foto_perfil
                        ? <img src={post.usuario.foto_perfil} alt={post.usuario.nombre} className="avatar-feed-img" />
                        : post.usuario.nombre?.charAt(0)}
                    </div>
                    <div className="post-user-info">
                      <h4>
                        <span
                          className="clickable-user"
                          onClick={() => onSwitch("perfilPublico", post.usuario.id_usuario)}
                        >
                          {post.usuario.nombre}
                        </span>
                    
                      </h4>
                      <span>{new Date(post.fecha_publicacion).toLocaleString()}</span>
                    </div>
                  </div>
 
                  {/* Menú 3 puntos */}
                  {esMio && (
                    <div className="post-menu-container" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-tres-puntos"
                        onClick={() => setMenuPostAbierto(
                          menuPostAbierto === post.id_publicacion ? null : post.id_publicacion
                        )}
                      >
                        ···
                      </button>
                      {menuPostAbierto === post.id_publicacion && (
                        <div className="dropdown-menu-post">
                          <button onClick={() => { setMenuPostAbierto(null); abrirModalEdicion(post); }}>
                            ✏️ Editar
                          </button>
                          <button
                            className="dropdown-eliminar"
                            onClick={() => { setMenuPostAbierto(null); eliminarPost(post.id_publicacion); }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
 
                {/* Contenido */}
                <p className="post-text">{post.contenido_texto}</p>
                {post.imagenes?.[0] && (
                  <img src={post.imagenes[0].url_imagen} alt="post" className="post-image" />
                )}
 
                {/* Acciones */}
                <div className="post-actions">
                  <button
                    className={`btn-like ${likeado ? "liked" : ""}`}
                    onClick={() => toggleLike(post.id_publicacion)}
                  >
                    {likeado ? "❤️" : "🤍"} {post.likes.length}
                  </button>
                  <button onClick={() => toggleComentarios(post.id_publicacion)}>
                    💬 {post.comentarios.length}
                  </button>
                </div>
 
                {/* Comentarios */}
                {mostrarComentarios[post.id_publicacion] && (
                  <div className="comentarios-dropdown">
                    {post.comentarios.length === 0 && (
                      <p className="sin-comentarios">Sé el primero en comentar 🐾</p>
                    )}
 
                    {post.comentarios.map((c) => {
                      const esMiComentario = usuarioActual?.id_usuario === c.usuario.id_usuario;
                      const puedeBorrar    = esMiComentario || esMio;
 
                      return (
                        <div className="comentario-item" key={c.id_comentario}>
                          {editandoComentario === c.id_comentario ? (
                            <div className="comentario-edit-inline">
                              <input
                                type="text"
                                value={textoComentarioEditado}
                                onChange={(e) => setTextoComentarioEditado(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") guardarEdicionComentario(c.id_comentario);
                                  if (e.key === "Escape") setEditandoComentario(null);
                                }}
                                autoFocus
                              />
                              <div className="comentario-edit-btns">
                                <button
                                  onClick={() => guardarEdicionComentario(c.id_comentario)}
                                  disabled={loadingComentario}
                                >
                                  {loadingComentario ? "..." : "Guardar"}
                                </button>
                                <button onClick={() => setEditandoComentario(null)}>
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="comentario-cuerpo">
                              <div className="comentario-texto">
                                <strong
                                  className="comentario-autor"
                                  onClick={() => onSwitch("perfilPublico", c.usuario.id_usuario)}
                                >
                                  {c.usuario.nombre}
                                </strong>
                                {" "}{c.contenido}
                              </div>
                              <div className="comentario-acciones">
                                {esMiComentario && (
                                  <button
                                    className="btn-comentario-accion"
                                    onClick={() => iniciarEdicionComentario(c)}
                                    title="Editar comentario"
                                  >
                                    ✏️
                                  </button>
                                )}
                                {puedeBorrar && (
                                  <button
                                    className="btn-comentario-accion eliminar"
                                    onClick={() => eliminarComentario(c.id_comentario)}
                                    title="Eliminar comentario"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
 
                    {/* Input nuevo comentario */}
                    <div className="comentario-box-modern">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={comentarios[post.id_publicacion] || ""}
                        onChange={(e) =>
                          setComentarios((prev) => ({ ...prev, [post.id_publicacion]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") crearComentario(post.id_publicacion);
                        }}
                      />
                      <button onClick={() => crearComentario(post.id_publicacion)}>Enviar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </main>
 
        {/* SIDEBAR DERECHO */}
        <aside className="sidebar-right">
          <div className="widget-card">
            <h3>Tendencias</h3>
            <div className="tendencia-item">
              <span className="tendencia-tag">#AdoptaNoCompres</span>
              <span className="tendencia-count">25 publicaciones hoy</span>
            </div>
            <div className="tendencia-item">
              <span className="tendencia-tag">#HistoriasDeRescate</span>
              <span className="tendencia-count">5 publicaciones hoy</span>
            </div>
            <div className="tendencia-item">
              <span className="tendencia-tag">#Perroo</span>
              <span className="tendencia-count">15 publicaciones hoy</span>
            </div>
          </div>
 
          <div className="widget-card adoptame">
            <h3>Adóptame</h3>
            <div className="adopt-item">
              <div className="adopt-avatar">🐕</div>
              <div className="adopt-info"><strong>Toby</strong><span>Pug · 1 año</span></div>
              <span className="adopt-badge disponible">Disponible</span>
            </div>
            <div className="adopt-item">
              <div className="adopt-avatar">🐶</div>
              <div className="adopt-info"><strong>Bella</strong><span>Beagle · 4 meses</span></div>
              <span className="adopt-badge urgente">Urgente</span>
            </div>
          </div>
 
          <div className="widget-card lideres">
            <h3>Líderes de la Comunidad</h3>
            <div className="lider-item">
              <div className="lider-avatar">J</div>
              <span className="lider-nombre">Juan Marin</span>
              <span className="lider-pts">10 posts</span>
            </div>
            <div className="lider-item">
              <div className="lider-avatar">D</div>
              <span className="lider-nombre">Daniel</span>
              <span className="lider-pts">8 posts</span>
            </div>
            <div className="lider-item">
              <div className="lider-avatar">K</div>
              <span className="lider-nombre">Katalina</span>
              <span className="lider-pts">3 posts</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
 
export default Feed;