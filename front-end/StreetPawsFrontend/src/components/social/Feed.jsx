import { useEffect, useState } from "react";
import "./Feed.css";

const URL_POSTS = "http://localhost:3000/api/publicaciones";
const URL_INTERACCIONES = "http://localhost:3000/api/interacciones";

function Feed({ onSwitch }) {
  const [posts, setPosts] = useState([]);
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});

  const token = localStorage.getItem("token");

  const cargarPosts = async () => {
    const res = await fetch(URL_POSTS);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    cargarPosts();
  }, []);

  
  const crearPost = async (e) => {
    e.preventDefault();
    if (!contenido.trim() && !imagen) return;

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
  };

  const toggleLike = async (id) => {
    await fetch(`${URL_INTERACCIONES}/like/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    cargarPosts();
  };

  const crearComentario = async (id) => {
    const texto = comentarios[id];
    if (!texto?.trim()) return;

    await fetch(`${URL_INTERACCIONES}/comentario/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ contenido: texto })
    });

    setComentarios({ ...comentarios, [id]: "" });
    cargarPosts();
  };

  const toggleComentarios = (id) => {
    setMostrarComentarios({
      ...mostrarComentarios,
      [id]: !mostrarComentarios[id]
    });
  };

  return (
    <div className="feed-layout">
      {/* SIDEBAR */}
      <aside className="sidebar-left">
        <h2>🐾 Street Paws</h2>
        <ul>
          <li onClick={() => onSwitch("feed")}>🏠 Noticias</li>
          <li onClick={() => onSwitch("perfil")}>👤 Mi perfil</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="feed-main">
        <form className="crear-post" onSubmit={crearPost}>
          <textarea
            placeholder="¿Qué historia quieres compartir hoy?"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />

        <div className="upload-box">
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImagen(e.target.files[0])}
  />

  {imagen && (
    <div className="preview-box">
      <img
        src={URL.createObjectURL(imagen)}
        alt="preview"
        className="preview-image"
      />

      <button
        type="button"
        className="btn-remove-image"
        onClick={() => setImagen(null)}
      >
         Quitar imagen
      </button>
    </div>
  )}
</div>

          <button type="submit">Publicar</button>
        </form>

        {posts.map((post) => (
          <div className="post-card" key={post.id_publicacion}>
            <div className="post-header">
              <h4>{post.usuario.nombre}</h4>
              <span>
                {new Date(post.fecha_publicacion).toLocaleString()}
              </span>
            </div>

            <p>{post.contenido_texto}</p>

            {post.imagenes?.[0] && (
              <img
                src={post.imagenes[0].url_imagen}
                alt="post"
                className="post-image"
              />
            )}

            {/* 🔥 FOOTER SOCIAL */}
            <div className="post-actions">
              <button onClick={() => toggleLike(post.id_publicacion)}>
                ❤️ {post.likes.length} Me gusta
              </button>

              <button onClick={() => toggleComentarios(post.id_publicacion)}>
                💬 {post.comentarios.length} Comentarios
              </button>
            </div>

            {/* 💬 TOGGLE COMMENTS */}
            {mostrarComentarios[post.id_publicacion] && (
              <div className="comentarios">
                {post.comentarios.map((c) => (
                  <p key={c.id_comentario}>
                    <strong>{c.usuario.nombre}: </strong>
                    {c.contenido}
                  </p>
                ))}

                <div className="comentario-box">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={comentarios[post.id_publicacion] || ""}
                    onChange={(e) =>
                      setComentarios({
                        ...comentarios,
                        [post.id_publicacion]: e.target.value
                      })
                    }
                  />

                  <button
                    onClick={() => crearComentario(post.id_publicacion)}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* RIGHT */}
      <aside className="sidebar-right">
        <div className="widget">
          <h3>📈 Tendencias</h3>
          <p>#AdoptaNoCompres</p>
          <p>#HistoriasDeRescate</p>
        </div>
      </aside>
    </div>
  );
}

export default Feed;