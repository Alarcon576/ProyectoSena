import { useEffect, useMemo, useState } from "react";
import "./Explorar.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_MASCOTAS = "http://localhost:3000/api/mascotas";

function Explorar({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [resPosts, resMascotas] = await Promise.all([
        fetch(URL_POSTS),
        fetch(URL_MASCOTAS, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
      ]);

      const [dataPosts, dataMascotas] = await Promise.all([
        resPosts.json(),
        resMascotas.json()
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
          (b.likes?.length || 0) + (b.comentarios?.length || 0) -
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
            puntos: 0
          };
        }

        acc[usuario.id_usuario].puntos +=
          (post.likes?.length || 0) +
          (post.comentarios?.length || 0) * 2 +
          3;

        return acc;
      }, {})
    )
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 5);
  }, [posts]);

  if (loading) {
    return <div className="explorar-loading">Cargando explorar...</div>;
  }

  return (
    <div className="explorar-container">
      <div className="explorar-header">
        <h1>🔍 Explorar</h1>
        <p>Descubre mascotas, historias y personas increíbles</p>
      </div>

      <section className="explorar-section">
        <div className="section-title-row">
          <h2>🐾 Mascotas disponibles</h2>
          <button onClick={() => onSwitch("adopciones")}>Ver todas</button>
        </div>

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
      </section>

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
  );
}

export default Explorar;
