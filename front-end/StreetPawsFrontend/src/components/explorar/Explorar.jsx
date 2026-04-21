import { useEffect, useState } from "react";
import "./Explorar.css";

const API = "https://proyectosena-production-4ad5.up.railway.app/api";;

function Explorar({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resPosts = await fetch(`${API}/publicaciones`);
      const dataPosts = await resPosts.json();

      const resMascotas = await fetch(`${API}/mascotas`);
      const dataMascotas = await resMascotas.json();

      const resUsuarios = await fetch(`${API}/usuarios`);
      const dataUsuarios = await resUsuarios.json();

      //  ordenar por likes
      const topPosts = dataPosts
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 6);

      setPosts(topPosts);
      setMascotas(dataMascotas.slice(0, 6));
      setUsuarios(dataUsuarios.slice(0, 6));
    } catch (err) {
      console.error(err);
    }
  };

  const filtrar = (texto) => {
    setBusqueda(texto.toLowerCase());
  };

  return (
    <div className="explorar-container">

      {/* 🔎 BUSCADOR */}
      <div className="explorar-search">
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => filtrar(e.target.value)}
        />
      </div>

      {/*  POSTS */}
      <section>
        <h2> Tendencias</h2>
        <div className="explorar-grid">
          {posts
            .filter(p =>
              p.contenido_texto.toLowerCase().includes(busqueda)
            )
            .map((post) => (
              <div
                key={post.id_publicacion}
                className="explorar-card"
              >
                {post.imagenes?.[0] && (
                  <img src={post.imagenes[0].url_imagen} />
                )}
                <div className="explorar-overlay">
                  ❤️ {post.likes.length}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 🐾 MASCOTAS */}
      <section>
        <h2>🐾 Mascotas destacadas</h2>
        <div className="explorar-row">
          {mascotas.map((m) => (
            <div
              key={m.id_mascota}
              className="mascota-card"
              onClick={() => onSwitch("adopciones")}
            >
              {m.fotos?.[0] && (
                <img src={m.fotos[0].url_foto} />
              )}
              <p>{m.nombre}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 👤 USUARIOS */}
      <section>
        <h2>👤 Usuarios</h2>
        <div className="explorar-row">
          {usuarios.map((u) => (
            <div
              key={u.id_usuario}
              className="user-card"
              onClick={() =>
                onSwitch("perfilPublico", u.id_usuario)
              }
            >
              <div className="avatar">
                {u.foto_perfil ? (
                  <img src={u.foto_perfil} />
                ) : (
                  u.nombre[0]
                )}
              </div>
              <span>{u.nombre}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Explorar;