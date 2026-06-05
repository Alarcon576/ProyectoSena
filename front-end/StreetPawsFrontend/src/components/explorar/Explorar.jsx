import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar/Navbar";
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [rP, rM] = await Promise.all([
        fetch(URL_POSTS),
        fetch(URL_MASCOTAS, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [dP, dM] = await Promise.all([rP.json(), rM.json()]);
      setPosts(Array.isArray(dP) ? dP : []);
      setMascotas(Array.isArray(dM) ? dM : []);
    } catch {}
  };

  const mascotasDisponibles = useMemo(
    () =>
      mascotas.filter((m) => m.estado_adopcion === "Disponible").slice(0, 6),
    [mascotas],
  );

  const postsDestacados = useMemo(
    () =>
      [...posts]
        .sort(
          (a, b) =>
            (b.likes?.length || 0) +
            (b.comentarios?.length || 0) -
            ((a.likes?.length || 0) + (a.comentarios?.length || 0)),
        )
        .slice(0, 6),
    [posts],
  );

  const usuariosTop = useMemo(
    () =>
      Object.values(
        posts.reduce((acc, post) => {
          const u = post.usuario;
          if (!u) return acc;
          if (!acc[u.id_usuario])
            acc[u.id_usuario] = {
              id: u.id_usuario,
              nombre: u.nombre,
              foto_perfil: u.foto_perfil,
              puntos: 0,
            };
          acc[u.id_usuario].puntos +=
            (post.likes?.length || 0) + (post.comentarios?.length || 0) * 2 + 3;
          return acc;
        }, {}),
      )
        .sort((a, b) => b.puntos - a.puntos)
        .slice(0, 5),
    [posts],
  );

  return (
    <>
      <Navbar onSwitch={onSwitch} activeView="explorar" showNotifications />

      <div className="exp-hero-strip">
        <div className="exp-hero-text">
          <p className="exp-hero-eyebrow">Descubrir</p>
          <h1>Explora historias, mascotas y personas</h1>
        </div>
      </div>

      <div className="explorar-container">
        {/* ══ Mascotas ══ */}
        <section className="explorar-section">
          <div className="exp-section-header">
            <div className="exp-section-label">Adopción</div>
            <h2>Mascotas disponibles</h2>
            <button
              className="exp-ver-todas-btn"
              onClick={() => onSwitch("adopciones")}
            >
              Ver todas →
            </button>
          </div>
          {mascotasDisponibles.length === 0 ? (
            <p className="explorar-empty-text">
              No hay mascotas disponibles aún.
            </p>
          ) : (
            <div className="exp-mascotas-grid">
              {mascotasDisponibles.map((m, i) => (
                <div
                  className="exp-mascota-card"
                  key={m.id_mascota}
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <div className="exp-mascota-img">
                    {m.fotos?.[0]?.url_foto ? (
                      <img src={m.fotos[0].url_foto} alt={m.nombre} />
                    ) : (
                      <span className="exp-mascota-placeholder">
                        {m.nombre.charAt(0)}
                      </span>
                    )}
                    <div className="exp-mascota-overlay">
                      <button
                        className="exp-mascota-cta"
                        onClick={() => onSwitch("adopciones")}
                      >
                        Conocerme 🐾
                      </button>
                    </div>
                  </div>
                  <div className="exp-mascota-info">
                    <strong>{m.nombre}</strong>
                    <span>
                      {m.raza}
                      {m.edad
                        ? ` · ${m.edad} año${m.edad !== 1 ? "s" : ""}`
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══ Posts destacados ══ */}
        <section className="explorar-section">
          <div className="exp-section-header">
            <div className="exp-section-label">Comunidad</div>
            <h2>Publicaciones destacadas</h2>
          </div>
          {postsDestacados.length === 0 ? (
            <p className="explorar-empty-text">Aún no hay publicaciones.</p>
          ) : (
            <div className="exp-posts-grid">
              {postsDestacados.map((post, i) => {
                const tieneImg = !!post.imagenes?.[0];
                const esPrincipal = i === 0;
                return (
                  <div
                    className={`exp-post-card ${esPrincipal ? "exp-post-card--featured" : ""}`}
                    key={post.id_publicacion}
                  >
                    {tieneImg && (
                      <div className="exp-post-img-wrap">
                        <img src={post.imagenes[0].url_imagen} alt="post" />
                        {esPrincipal && (
                          <div className="exp-post-featured-badge">
                            🔥 Destacado
                          </div>
                        )}
                      </div>
                    )}
                    <div className="exp-post-body">
                      <div
                        className="exp-post-author"
                        onClick={() =>
                          onSwitch("perfilPublico", post.usuario.id_usuario)
                        }
                      >
                        <div className="exp-post-avatar">
                          {post.usuario?.foto_perfil ? (
                            <img
                              src={post.usuario.foto_perfil}
                              alt={post.usuario.nombre}
                            />
                          ) : (
                            post.usuario.nombre?.charAt(0)
                          )}
                        </div>
                        <span>{post.usuario.nombre}</span>
                      </div>
                      {post.contenido_texto && (
                        <p className="exp-post-text">{post.contenido_texto}</p>
                      )}
                      <div className="exp-post-stats">
                        <span>❤️ {post.likes?.length || 0}</span>
                        <span>💬 {post.comentarios?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══ Top usuarios ══ */}
        <section className="explorar-section explorar-section--last">
          <div className="exp-section-header">
            <div className="exp-section-label">Comunidad</div>
            <h2>Top usuarios</h2>
          </div>
          <div className="exp-usuarios-grid">
            {usuariosTop.map((user, i) => (
              <div
                className="exp-usuario-card"
                key={user.id}
                onClick={() => onSwitch("perfilPublico", user.id)}
              >
                <div className="exp-usuario-rank">#{i + 1}</div>
                <div className="exp-usuario-avatar">
                  {user.foto_perfil ? (
                    <img src={user.foto_perfil} alt={user.nombre} />
                  ) : (
                    user.nombre.charAt(0)
                  )}
                </div>
                <div className="exp-usuario-info">
                  <strong>{user.nombre}</strong>
                  <span>{user.puntos} pts</span>
                </div>
                {i === 0 && <div className="exp-usuario-crown">🏆</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default Explorar;
