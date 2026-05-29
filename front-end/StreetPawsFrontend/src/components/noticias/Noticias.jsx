import { useEffect, useState } from "react";
import "./Noticias.css";

const URL_NOTICIAS =
  "https://proyectosena-production-4ad5.up.railway.app/api/noticias";

function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNoticias();
  }, []);

  const cargarNoticias = async () => {
    try {
      const res = await fetch(URL_NOTICIAS);
      if (!res.ok) throw new Error("Error obteniendo noticias");
      const data = await res.json();
      setNoticias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="noticias-loading">
        <div className="noticias-spinner" />
        <p>Cargando noticias…</p>
      </div>
    );
  }

  if (noticias.length === 0) {
    return (
      <div className="noticias-container">
        <div className="noticias-empty">
          <span>📰</span>
          <p>No hay noticias disponibles por el momento</p>
        </div>
      </div>
    );
  }

  // Primera noticia como featured, el resto en el grid
  const [featured, ...resto] = noticias;

  return (
    <div className="noticias-container">

      {/* ── Encabezado editorial ── */}
      <div className="noticias-header">
        <div className="noticias-header-left">
          <p className="noticias-eyebrow">Street Paws · Actualidad</p>
          <h2>Noticias de Mascotas</h2>
        </div>
        <span className="noticias-header-meta">{noticias.length} artículos</span>
      </div>

      {/* ── Noticia destacada ── */}
      <a
        className="noticias-featured"
        href={featured.url}
        target="_blank"
        rel="noreferrer"
      >
        <div className="noticias-featured-img">
          <span className="noticias-featured-badge">Destacado</span>
          {featured.image
            ? <img src={featured.image} alt={featured.title} />
            : <div className="noticia-card-img-placeholder">🐾</div>}
        </div>
        <div className="noticias-featured-body">
          <h3>{featured.title}</h3>
          {featured.description && <p>{featured.description}</p>}
          <span className="noticias-featured-link">Leer artículo</span>
        </div>
      </a>

      {/* ── Grid de noticias ── */}
      {resto.length > 0 && (
        <div className="noticias-grid">
          {resto.map((n, index) => (
            <a
              className="noticia-card"
              key={index}
              href={n.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="noticia-card-img-wrap">
                {n.image
                  ? <img src={n.image} alt={n.title} />
                  : <div className="noticia-card-img-placeholder">🐾</div>}
              </div>
              <div className="noticia-card-body">
                <h3>{n.title}</h3>
                {n.description && <p>{n.description}</p>}
                <span className="noticia-card-link">Leer noticia</span>
              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  );
}

export default Noticias;