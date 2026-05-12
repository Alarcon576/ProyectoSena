import { useEffect, useMemo, useState } from "react";
import "./Explorar.css";

const URL_POSTS =
  "https://proyectosena-production-4ad5.up.railway.app/api/publicaciones";
const URL_MASCOTAS =
  "https://proyectosena-production-4ad5.up.railway.app/api/mascotas";
const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";

function Explorar({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarTodo();
    cargarUsuarioActual();
  }, []);

  /* ── Cerrar menú al click fuera ── */
  useEffect(() => {
    const cerrar = () => setMenuAvatarAbierto(false);
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

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

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [resPosts, resMascotas] = await Promise.all([
        fetch(URL_POSTS),
        fetch(URL_MASCOTAS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [dataPosts, dataMascotas] = await Promise.all([
        resPosts.json(),
        resMascotas.json(),
      ]);

      setPosts(Array.isArray(dataPosts) ? dataPosts : []);
      setMascotas(Array.isArray(dataMascotas) ? dataMascotas : []);
    } catch (error) {
      console.error("Error cargando explorar:", error);
    } finally {
      setLoading(false);
    }
  };

  const mascotasDisponibles = useMemo(() => {
    return mascotas
      .filter((m) => m.estado_adopcion === "Disponible")
      .slice(0, 6);
  }, [mascotas]);

  const postsDestacados = useMemo(() => {
    return [...posts]
      .sort(
        (a, b) =>
          (b.likes?.length || 0) +
          (b.comentarios?.length || 0) -
          ((a.likes?.length || 0) + (a.comentarios?.length || 0))
      )
      .slice(0, 5);
  }, [posts]);

  const usuariosTop = useMemo(() => {
    return Object.values(
      posts.reduce((acc, post) => {
        const usuario = post.usuario;
        if (!usuario) return acc;
        if (!acc[usuario.id_usuario]) {
          acc[usuario.id_usuario] = {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            foto_perfil: usuario.foto_perfil,
            puntos: 0,
          };
        }
        acc[usuario.id_usuario].puntos +=
          (post.likes?.length || 0) + (post.comentarios?.length || 0) * 2 + 3;
        return acc;
      }, {})
    )
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 5);
  }, [posts]);

  if (loading) {
    return (
      <>
        <nav className="exp-navbar">
          <div className="exp-nav-brand">Street Paws</div>
          <div className="exp-nav-links">
            <span onClick={() => onSwitch("feed")}>Inicio</span>
            <span className="active">Explorar</span>
            <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
          </div>
          <div className="exp-nav-right" />
        </nav>
        <div className="explorar-loading">
          <div className="explorar-spinner" />
          <p>Cargando explorar...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <nav className="exp-navbar">
        <div className="exp-nav-brand" onClick={() => onSwitch("feed")}>
          Street Paws
        </div>

        <div className="exp-nav-links">
          <span onClick={() => onSwitch("feed")}>Inicio</span>
          <span className="active">Explorar</span>
          <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
        </div>

        <div className="exp-nav-right">
          <div
            className="exp-nav-avatar-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAvatarAbierto((v) => !v);
            }}
          >
            <div className="exp-nav-avatar">
              {usuarioActual?.foto_perfil ? (
                <img
                  src={usuarioActual.foto_perfil}
                  alt={usuarioActual.nombre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                usuarioActual?.nombre?.charAt(0) || "U"
              )}
            </div>

            {menuAvatarAbierto && (
              <div className="exp-dropdown-avatar">
                <div className="exp-dropdown-header">
                  <span className="exp-dropdown-nombre">
                    {usuarioActual?.nombre || "Usuario"}
                  </span>
                  <span className="exp-dropdown-email">
                    {usuarioActual?.email || ""}
                  </span>
                </div>
                <div className="exp-dropdown-divider" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAvatarAbierto(false);
                    onSwitch("perfil");
                  }}
                >
                  👤 Mi perfil
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAvatarAbierto(false);
                    onSwitch("configuracion");
                  }}
                >
                  ⚙️ Configuración
                </button>
                <div className="exp-dropdown-divider" />
                <button
                  className="exp-dropdown-logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.removeItem("token");
                    onSwitch("login");
                  }}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══ CONTENIDO ══ */}
      <div className="explorar-container">
        <div className="explorar-header">
          <h1>🔍 Explorar</h1>
          <p>Descubre mascotas, historias y personas increíbles</p>
        </div>

        {/* ── Mascotas disponibles ── */}
        <section className="explorar-section">
          <div className="section-title-row">
            <h2>🐾 Mascotas disponibles</h2>
            <button onClick={() => onSwitch("adopciones")}>Ver todas</button>
          </div>

          {mascotasDisponibles.length === 0 ? (
            <p className="explorar-empty-text">No hay mascotas disponibles aún.</p>
          ) : (
            <div className="mascotas-grid">
              {mascotasDisponibles.map((mascota) => (
                <div className="mascota-card" key={mascota.id_mascota}>
                  <div className="mascota-foto">
                    {mascota.fotos?.[0]?.url_foto ? (
                      <img
                        src={mascota.fotos[0].url_foto}
                        alt={mascota.nombre}
                      />
                    ) : (
                      <span>{mascota.nombre.charAt(0)}</span>
                    )}
                  </div>
                  <h3>{mascota.nombre}</h3>
                  <p>
                    {mascota.raza} · {mascota.edad} años
                  </p>
                  <button onClick={() => onSwitch("adopciones")}>
                    💚 Adoptar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Publicaciones destacadas ── */}
        <section className="explorar-section">
          <h2>🔥 Publicaciones destacadas</h2>
          <div className="destacados-list">
            {postsDestacados.map((post) => (
              <div className="destacado-card" key={post.id_publicacion}>
                <div className="destacado-top">
                  <strong
                    className="clickable-user"
                    onClick={() =>
                      onSwitch("perfilPublico", post.usuario.id_usuario)
                    }
                  >
                    {post.usuario.nombre}
                  </strong>
                  <span>
                    ❤️ {post.likes.length} · 💬 {post.comentarios.length}
                  </span>
                </div>
                <p>{post.contenido_texto}</p>
                {post.imagenes?.[0] && (
                  <img
                    src={post.imagenes[0].url_imagen}
                    alt="post"
                    className="destacado-img"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Top usuarios ── */}
        <section className="explorar-section">
          <h2>🏆 Top usuarios</h2>
          <div className="usuarios-top-list">
            {usuariosTop.map((user, index) => (
              <div className="usuario-top-card" key={user.id}>
                <div className="usuario-top-avatar">
                  {user.foto_perfil ? (
                    <img src={user.foto_perfil} alt={user.nombre} />
                  ) : (
                    user.nombre.charAt(0)
                  )}
                </div>
                <div className="usuario-top-info">
                  <strong
                    className="clickable-user"
                    onClick={() => onSwitch("perfilPublico", user.id)}
                  >
                    #{index + 1} {user.nombre}
                  </strong>
                  <span>{user.puntos} puntos</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default Explorar;