import { useEffect, useRef, useState, useMemo } from "react";
import "./Feed.css";
import Navbar from "../navbar/Navbar";

const URL_MASCOTAS =
  "https://proyectosena-production-4ad5.up.railway.app/api/mascotas";
const URL_POSTS =
  "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_INTERACCIONES =
  "https://proyectosena-production-4ad5.up.railway.app/api/interacciones";
const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";
const URL_IA = "https://proyectosena-production-4ad5.up.railway.app/api/ia";

const TIPS = [
  "🐶 Pasea a tu perro al menos 30 minutos al día para mantenerlo saludable.",
  "🐱 Los gatos necesitan agua fresca disponible en todo momento.",
  "💉 Mantén el esquema de vacunación de tu mascota al día.",
  "🦴 Evita dar huesos cocidos a los perros, pueden astillarse.",
  "❤️ Dedica tiempo diario para jugar con tu mascota.",
  "🥕 Algunas verduras son excelentes premios saludables.",
  "🌞 Evita pasear a tu mascota en horas de calor extremo.",
  "🧼 Limpia regularmente los recipientes de agua y comida.",
  "🏥 Realiza chequeos veterinarios periódicos.",
  "🐾 La esterilización ayuda a prevenir enfermedades.",
  "🚰 La deshidratación puede ser peligrosa incluso en días frescos.",
  "🐕 El ejercicio reduce el estrés y la ansiedad en perros.",
  "🐈 Los gatos también necesitan estimulación mental diaria.",
  "💚 Adoptar salva vidas y ayuda a reducir el abandono animal.",
];

function Feed({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  // Modal edición post
  const [modalEditPost, setModalEditPost] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [imagenEditada, setImagenEditada] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Edición comentarios
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [textoComentarioEditado, setTextoComentarioEditado] = useState("");
  const [loadingComentario, setLoadingComentario] = useState(false);

  const [enviandoComentario, setEnviandoComentario] = useState(null);

  // Menú post
  const [menuPostAbierto, setMenuPostAbierto] = useState(null);

  // Drawer móvil
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const inputImagenRef = useRef(null);
  const token = localStorage.getItem("token");

  const [mascotas, setMascotas] = useState([]);
  const [mascotasRandom, setMascotasRandom] = useState([]);

  const [sintomasIA, setSintomasIA] = useState("");
  const [historialIA, setHistorialIA] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);

  // Tip del día
  const [tipDelDia, setTipDelDia] = useState("");

  useEffect(() => {
    const hoy = new Date();
    const indice =
      (hoy.getDate() + hoy.getMonth() + hoy.getFullYear()) % TIPS.length;
    setTipDelDia(TIPS[indice]);
  }, []);

  /* ── Cerrar menú post al click fuera ── */
  useEffect(() => {
    const cerrar = (e) => {
      if (!e.target.closest(".post-menu-container")) setMenuPostAbierto(null);
    };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  /* ── Cerrar modal/drawer con Escape ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setModalEditPost(null);
        setDrawerAbierto(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ── Bloquear scroll cuando el drawer está abierto ── */
  useEffect(() => {
    document.body.style.overflow = drawerAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerAbierto]);

  /* ════ DATA ════ */
  const cargarPosts = async () => {
    try {
      const res = await fetch(URL_POSTS);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error cargando posts:", err);
    }
  };

  const cargarUsuarioActual = async () => {
    try {
      const res = await fetch(`${URL_PROFILE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarioActual(data);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  useEffect(() => {
    cargarPosts();
    cargarUsuarioActual();
  }, []);

  /* ════ CREAR POST ════ */
  const crearPost = async (e) => {
    e.preventDefault();
    if (!contenido.trim() && !imagen) {
      alert("Escribe algo o agrega una imagen para publicar 🐾");
      return;
    }
    setLoadingPost(true);
    try {
      const fd = new FormData();
      fd.append("contenido_texto", contenido.trim());
      if (imagen) fd.append("imagen", imagen);

      const res = await fetch(URL_POSTS, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error || "La publicación no cumple las normas de la comunidad",
        );
        return;
      }
      setContenido("");
      setImagen(null);
      if (inputImagenRef.current) inputImagenRef.current.value = "";
      await cargarPosts();
    } catch (err) {
      console.error("Error creando publicación:", err);
      alert("Ocurrió un error al crear la publicación");
    } finally {
      setLoadingPost(false);
    }
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
        headers: { Authorization: `Bearer ${token}` },
      });
      await cargarPosts();
    } catch (err) {
      console.error("Error dando like:", err);
    }
  };

  const yaDioLike = (post) =>
    post.likes?.some((l) => l.id_usuario === usuarioActual?.id_usuario);

  /* ════ COMENTARIOS ════ */
  const crearComentario = async (idPost) => {
    const texto = comentarios[idPost];
    if (!texto?.trim()) return;
    setEnviandoComentario(idPost);
    try {
      const res = await fetch(`${URL_INTERACCIONES}/comentario/${idPost}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contenido: texto }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al comentar");
        return;
      }
      setComentarios((prev) => ({ ...prev, [idPost]: "" }));
      await cargarPosts();
    } catch (err) {
      console.error("Error comentando:", err);
    } finally {
      setEnviandoComentario(null);
    }
  };

  const eliminarComentario = async (idComentario) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      const res = await fetch(
        `${URL_INTERACCIONES}/comentario/${idComentario}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo eliminar el comentario");
        return;
      }
      await cargarPosts();
    } catch (err) {
      console.error("Error eliminando comentario:", err);
    }
  };

  const iniciarEdicionComentario = (c) => {
    setEditandoComentario(c.id_comentario);
    setTextoComentarioEditado(c.contenido);
  };

  const guardarEdicionComentario = async (idComentario) => {
    if (!textoComentarioEditado.trim()) return;
    setLoadingComentario(true);
    try {
      const res = await fetch(
        `${URL_INTERACCIONES}/comentario/${idComentario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contenido: textoComentarioEditado }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo editar el comentario");
        return;
      }
      setEditandoComentario(null);
      setTextoComentarioEditado("");
      await cargarPosts();
    } catch (err) {
      console.error("Error editando comentario:", err);
    } finally {
      setLoadingComentario(false);
    }
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
    if (
      !textoEditado.trim() &&
      !imagenEditada &&
      !modalEditPost.imagenes?.[0]
    ) {
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
        body: fd,
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
    } finally {
      setLoadingEdit(false);
    }
  };

  /* ════ ELIMINAR POST ════ */
  const eliminarPost = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?"))
      return;
    try {
      const res = await fetch(`${URL_POSTS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        alert("No se pudo eliminar la publicación");
        return;
      }
      await cargarPosts();
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  const esFiltroHashtag = busqueda.startsWith("#");
  const postsFiltrados = posts.filter((p) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    const enNombre = p.usuario.nombre.toLowerCase().includes(q);
    const enContenido = (p.contenido_texto || "").toLowerCase().includes(q);
    return enNombre || enContenido;
  });

  const lideresComunidad = Object.values(
    posts.reduce((acc, post) => {
      const usuario = post.usuario;
      if (!acc[usuario.id_usuario]) {
        acc[usuario.id_usuario] = {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          foto_perfil: usuario.foto_perfil,
          totalPosts: 0,
          totalLikes: 0,
          totalComentarios: 0,
          score: 0,
        };
      }
      acc[usuario.id_usuario].totalPosts += 1;
      acc[usuario.id_usuario].totalLikes += post.likes?.length || 0;
      acc[usuario.id_usuario].totalComentarios += post.comentarios?.length || 0;
      return acc;
    }, {}),
  )
    .map((u) => ({
      ...u,
      score: u.totalPosts * 3 + u.totalLikes + u.totalComentarios * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const obtenerMascotasAleatorias = (lista, cantidad = 2) => {
    if (!lista || lista.length === 0) return [];
    const disponibles = lista.filter(
      (m) => m.estado_adopcion?.toLowerCase() === "disponible",
    );
    const base = disponibles.length > 0 ? disponibles : lista;
    return [...base].sort(() => Math.random() - 0.5).slice(0, cantidad);
  };

  const cargarMascotas = async () => {
    try {
      const res = await fetch(URL_MASCOTAS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        setMascotas([]);
        return;
      }
      setMascotas(data);
    } catch (error) {
      console.error("Error cargando mascotas:", error);
      setMascotas([]);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, []);

  useEffect(() => {
    if (mascotas.length === 0) return;
    const rotar = () =>
      setMascotasRandom(obtenerMascotasAleatorias(mascotas, 2));
    rotar();
    const intervalo = setInterval(rotar, 15000);
    return () => clearInterval(intervalo);
  }, [mascotas]);

  const hashtagsDinamicos = Object.entries(
    posts.reduce((acc, post) => {
      const hashtags = (post.contenido_texto || "").match(/#\w+/g) || [];
      hashtags.forEach((tag) => {
        const l = tag.toLowerCase();
        acc[l] = (acc[l] || 0) + 1;
      });
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const consultarSaludIA = async () => {
    if (!sintomasIA.trim()) return;
    const consultaTexto = sintomasIA.trim();
    setSintomasIA("");
    setLoadingIA(true);
    setHistorialIA((prev) => [
      ...prev,
      { consulta: consultaTexto, respuesta: null, nivel: null },
    ]);
    try {
      const res = await fetch(`${URL_IA}/salud`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          especie: "Mascota",
          edad: 1,
          sintomas: consultaTexto,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHistorialIA((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = {
            ...copia[copia.length - 1],
            respuesta: "No se pudo consultar la IA.",
            nivel: "error",
          };
          return copia;
        });
        return;
      }
      let texto = data.resultado.replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(texto);
      } catch {
        parsed = { nivel: "desconocido", orientacion: texto };
      }
      setHistorialIA((prev) => {
        const copia = [...prev];
        copia[copia.length - 1] = {
          ...copia[copia.length - 1],
          respuesta: parsed.orientacion,
          nivel: parsed.nivel,
        };
        return copia;
      });
    } catch {
      setHistorialIA((prev) => {
        const copia = [...prev];
        copia[copia.length - 1] = {
          ...copia[copia.length - 1],
          respuesta: "Error de conexión.",
          nivel: "error",
        };
        return copia;
      });
    } finally {
      setLoadingIA(false);
    }
  };

  /* ── Sidebar izquierdo ── */
  const SidebarLeftContent = useMemo(
    () => (
      <>
        <ul className="menu-list">
          <li onClick={() => onSwitch("noticias")}>Noticias</li>
        </ul>
        <div className="tip-box">
          <h4>💡 Tip del día</h4>
          <p>{tipDelDia}</p>
        </div>
      </>
    ),
    [tipDelDia],
  );

  const SidebarRightContent = useMemo(
    () => (
      <>
        <div className="widget-card salud-ia">
          <h3>Orientación básica de salud</h3>

          {historialIA.length > 0 && (
            <div className="ia-chat-historial">
              {historialIA.map((item, i) => (
                <div key={i} className="ia-chat-turno">
                  <div className="ia-burbuja ia-burbuja--usuario">
                    <span>{item.consulta}</span>
                  </div>
                  {item.respuesta === null ? (
                    <div className="ia-burbuja ia-burbuja--ia ia-burbuja--loading">
                      <span className="ia-dot" />
                      <span className="ia-dot" />
                      <span className="ia-dot" />
                    </div>
                  ) : (
                    <div
                      className={`ia-burbuja ia-burbuja--ia nivel-burbuja-${item.nivel}`}
                    >
                      {item.nivel &&
                        item.nivel !== "desconocido" &&
                        item.nivel !== "error" && (
                          <span className="ia-nivel-tag">
                            Nivel: {item.nivel}
                          </span>
                        )}
                      <span>{item.respuesta}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="ia-input-row">
            <textarea
              className="salud-ia-input"
              placeholder="Ej: mi perro no quiere comer…"
              value={sintomasIA}
              onChange={(e) => setSintomasIA(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  consultarSaludIA();
                }
              }}
              rows={2}
            />
            <button
              className="btn-salud-ia-send"
              onClick={consultarSaludIA}
              disabled={loadingIA || !sintomasIA.trim()}
              title="Enviar"
            >
              {loadingIA ? <span className="spinner spinner-dark-sm" /> : "↑"}
            </button>
          </div>
          {historialIA.length > 0 && (
            <button
              className="ia-limpiar-btn"
              onClick={() => setHistorialIA([])}
            >
              Limpiar historial
            </button>
          )}
        </div>

        <div className="widget-card">
          <h3>Tendencias</h3>
          {hashtagsDinamicos.length === 0 ? (
            <p>No hay tendencias aún</p>
          ) : (
            hashtagsDinamicos.map(([tag, total]) => (
              <div
                className={`tendencia-item ${busqueda === tag ? "tendencia-item--active" : ""}`}
                key={tag}
                onClick={() => {
                  setBusqueda(busqueda === tag ? "" : tag);
                  setDrawerAbierto(false);
                }}
              >
                <span className="tendencia-tag">{tag}</span>
                <span className="tendencia-count">{total} publicaciones</span>
              </div>
            ))
          )}
        </div>

        <div className="widget-card adoptame">
          <h3>Adóptame</h3>
          {mascotasRandom.length === 0 ? (
            <p>No hay mascotas disponibles</p>
          ) : (
            mascotasRandom.map((mascota) => (
              <div
                className="adopt-item"
                key={mascota.id_mascota}
                onClick={() => onSwitch("adopciones")}
              >
                <div className="adopt-avatar">
                  {mascota.fotos?.[0]?.url_foto ? (
                    <img
                      src={mascota.fotos[0].url_foto}
                      alt={mascota.nombre}
                      className="avatar-feed-img"
                    />
                  ) : (
                    mascota.nombre.charAt(0)
                  )}
                </div>
                <div className="adopt-info">
                  <strong>{mascota.nombre}</strong>
                  <span>
                    {mascota.raza} · {mascota.edad}
                  </span>
                </div>
                <span className="adopt-badge disponible">Disponible</span>
              </div>
            ))
          )}
        </div>

        <div className="widget-card lideres">
          <h3>Top 5 de la Comunidad</h3>
          {lideresComunidad.map((lider, index) => (
            <div className="lider-item" key={lider.id}>
              <div className="lider-avatar">
                {lider.foto_perfil ? (
                  <img
                    src={lider.foto_perfil}
                    alt={lider.nombre}
                    className="avatar-feed-img"
                  />
                ) : (
                  lider.nombre.charAt(0)
                )}
              </div>
              <span
                className="lider-nombre clickable-user"
                onClick={() => onSwitch("perfilPublico", lider.id)}
              >
                #{index + 1} {lider.nombre}
              </span>
              <span className="lider-pts">{lider.score} pts</span>
            </div>
          ))}
        </div>
      </>
    ),
    [
      sintomasIA,
      historialIA,
      loadingIA,
      hashtagsDinamicos,
      mascotasRandom,
      lideresComunidad,
      busqueda,
    ],
  );

  return (
    <>
      {/* ══ MODAL EDICIÓN DE POST ══ */}
      {modalEditPost && (
        <div className="modal-overlay" onClick={() => setModalEditPost(null)}>
          <div className="modal-edit-post" onClick={(e) => e.stopPropagation()}>
            <div className="modal-edit-header">
              <h2>Editar publicación</h2>
              <button
                className="modal-close-btn"
                onClick={() => setModalEditPost(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-edit-user">
              <div className="avatar-mini">
                {usuarioActual?.foto_perfil ? (
                  <img
                    src={usuarioActual.foto_perfil}
                    alt=""
                    className="avatar-feed-img"
                  />
                ) : (
                  usuarioActual?.nombre?.charAt(0) || "U"
                )}
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
            {!imagenEditada && modalEditPost.imagenes?.[0] && (
              <div className="modal-edit-img-preview">
                <img src={modalEditPost.imagenes[0].url_imagen} alt="actual" />
                <span className="modal-edit-img-label">Imagen actual</span>
              </div>
            )}
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
                <button
                  className="btn-cancelar"
                  onClick={() => setModalEditPost(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-guardar"
                  onClick={guardarEdicion}
                  disabled={loadingEdit}
                >
                  {loadingEdit ? (
                    <span className="spinner" />
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DRAWER ══ */}
      {drawerAbierto && (
        <div
          className="sidebar-drawer-overlay"
          onClick={() => setDrawerAbierto(false)}
        />
      )}
      <div className={`sidebar-drawer ${drawerAbierto ? "open" : ""}`}>
        <div className="sidebar-drawer-header">
          <h3>Street Paws</h3>
          <button
            className="btn-drawer-close"
            onClick={() => setDrawerAbierto(false)}
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>
        <div className="sidebar-drawer-content">
          {SidebarLeftContent}
          {SidebarRightContent}
        </div>
      </div>

      {/* ══ NAVBAR UNIFICADA ══ */}
      <Navbar
        onSwitch={onSwitch}
        activeView="feed"
        showSearch={true}
        searchValue={busqueda}
        onSearchChange={(e) => setBusqueda(e.target.value)}
        showNotifications={true}
        showSidebarToggle={true}
        onSidebarToggle={() => setDrawerAbierto((v) => !v)}
      />

      {/* ══ LAYOUT ══ */}
      <div className="feed-layout">
        <aside className="sidebar-left">{SidebarLeftContent}</aside>

        <main className="feed-main">
          {/* ── Crear post ── */}
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
                placeholder="¿Tienes alguna historia o mascota que compartir?"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
              />
            </div>
            {imagen && (
              <div className="crear-post-img-preview">
                <img
                  src={URL.createObjectURL(imagen)}
                  alt="preview"
                  className="preview-image"
                />
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
                  onChange={(e) => {
                    if (e.target.files[0]) setImagen(e.target.files[0]);
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={loadingPost || (!contenido.trim() && !imagen)}
              >
                {loadingPost ? <span className="spinner" /> : "Publicar"}
              </button>
            </div>
          </form>

          {/* ── Chip filtro activo ── */}
          {busqueda.trim() && (
            <div className="feed-filtro-activo">
              <span className="feed-filtro-chip">
                {esFiltroHashtag ? "🏷️" : "🔍"} {busqueda}
                <button onClick={() => setBusqueda("")} title="Limpiar filtro">
                  ✕
                </button>
              </span>
              <span className="feed-filtro-count">
                {postsFiltrados.length === 0
                  ? "Sin resultados"
                  : `${postsFiltrados.length} publicación${postsFiltrados.length !== 1 ? "es" : ""}`}
              </span>
            </div>
          )}

          {/* ── Sin resultados ── */}
          {busqueda.trim() && postsFiltrados.length === 0 && (
            <div className="feed-empty">
              <span>🔍</span>
              <p>
                No hay publicaciones con <strong>{busqueda}</strong>
              </p>
              <button onClick={() => setBusqueda("")}>Limpiar filtro</button>
            </div>
          )}

          {/* ── Posts ── */}
          {postsFiltrados.map((post) => {
            const esMio = usuarioActual?.id_usuario === post.usuario.id_usuario;
            const likeado = yaDioLike(post);
            const enviando = enviandoComentario === post.id_publicacion;

            return (
              <div
                className="post-card"
                key={post.id_publicacion}
                id={`post-${post.id_publicacion}`}
              >
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
                      <h4>
                        <span
                          className="clickable-user"
                          onClick={() =>
                            onSwitch("perfilPublico", post.usuario.id_usuario)
                          }
                        >
                          {post.usuario.nombre}
                        </span>
                      </h4>
                      <span>
                        {new Date(post.fecha_publicacion).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {esMio && (
                    <div
                      className="post-menu-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn-tres-puntos"
                        onClick={() =>
                          setMenuPostAbierto(
                            menuPostAbierto === post.id_publicacion
                              ? null
                              : post.id_publicacion,
                          )
                        }
                      >
                        ···
                      </button>
                      {menuPostAbierto === post.id_publicacion && (
                        <div className="dropdown-menu-post">
                          <button
                            onClick={() => {
                              setMenuPostAbierto(null);
                              abrirModalEdicion(post);
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="dropdown-eliminar"
                            onClick={() => {
                              setMenuPostAbierto(null);
                              eliminarPost(post.id_publicacion);
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {post.contenido_texto && (
                  <p className="post-text">{post.contenido_texto}</p>
                )}
                {post.imagenes?.[0] && (
                  <img
                    src={post.imagenes[0].url_imagen}
                    alt="post"
                    className="post-image"
                  />
                )}

                <div className="post-actions">
                  <button
                    className={`btn-like ${likeado ? "liked" : ""}`}
                    onClick={() => toggleLike(post.id_publicacion)}
                  >
                    {likeado ? "❤️" : "🤍"} {post.likes.length}
                  </button>
                  <button
                    onClick={() => toggleComentarios(post.id_publicacion)}
                  >
                    💬 {post.comentarios.length}
                  </button>
                </div>

                {mostrarComentarios[post.id_publicacion] && (
                  <div className="comentarios-dropdown">
                    {post.comentarios.length === 0 && (
                      <p className="sin-comentarios">
                        Sé el primero en comentar 🐾
                      </p>
                    )}
                    {post.comentarios.map((c) => {
                      const esMiComentario =
                        usuarioActual?.id_usuario === c.usuario.id_usuario;
                      const puedeBorrar = esMiComentario || esMio;
                      return (
                        <div className="comentario-item" key={c.id_comentario}>
                          {editandoComentario === c.id_comentario ? (
                            <div className="comentario-edit-inline">
                              <input
                                type="text"
                                value={textoComentarioEditado}
                                onChange={(e) =>
                                  setTextoComentarioEditado(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    guardarEdicionComentario(c.id_comentario);
                                  if (e.key === "Escape")
                                    setEditandoComentario(null);
                                }}
                                autoFocus
                              />
                              <div className="comentario-edit-btns">
                                <button
                                  onClick={() =>
                                    guardarEdicionComentario(c.id_comentario)
                                  }
                                  disabled={loadingComentario}
                                >
                                  {loadingComentario ? "..." : "Guardar"}
                                </button>
                                <button
                                  onClick={() => setEditandoComentario(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="comentario-cuerpo">
                              <div className="comentario-texto">
                                <strong
                                  className="comentario-autor"
                                  onClick={() =>
                                    onSwitch(
                                      "perfilPublico",
                                      c.usuario.id_usuario,
                                    )
                                  }
                                >
                                  {c.usuario.nombre}
                                </strong>{" "}
                                {c.contenido}
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
                                    onClick={() =>
                                      eliminarComentario(c.id_comentario)
                                    }
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
                    <div className="comentario-box-modern">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={comentarios[post.id_publicacion] || ""}
                        disabled={enviando}
                        onChange={(e) =>
                          setComentarios((prev) => ({
                            ...prev,
                            [post.id_publicacion]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !enviando)
                            crearComentario(post.id_publicacion);
                        }}
                      />
                      <button
                        onClick={() => crearComentario(post.id_publicacion)}
                        disabled={enviando}
                      >
                        {enviando ? <span className="spinner" /> : "Enviar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </main>

        <aside className="sidebar-right">{SidebarRightContent}</aside>
      </div>
    </>
  );
}

export default Feed;
