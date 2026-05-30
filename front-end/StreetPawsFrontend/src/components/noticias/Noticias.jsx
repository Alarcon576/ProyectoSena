import { useEffect, useState } from "react";
import "./Noticias.css";

const URL_NOTICIAS =
  "https://proyectosena-production-4ad5.up.railway.app/api/noticias";

function Noticias({ onSwitch }) {
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
      <div style={{ background: 'var(--cream, #faf7f3)', minHeight: '100vh' }}>
        <nav className="noticias-navbar">
          <div className="noticias-nav-brand" onClick={() => onSwitch("feed")}>Street Paws</div>
          <div className="noticias-nav-links">
            <span onClick={() => onSwitch("feed")}>Inicio</span>
            <span onClick={() => onSwitch("explorar")}>Explorar</span>
            <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
          </div>
          <button className="noticias-back-btn" onClick={() => onSwitch("feed")}>← Volver</button>
        </nav>
        <div className="noticias-loading">
          <div className="noticias-spinner" />
          <p>Cargando noticias…</p>
        </div>
      </div>
    );
  }

  if (noticias.length === 0) {
    return (
      <div style={{ background: 'var(--cream, #faf7f3)', minHeight: '100vh' }}>
        <nav className="noticias-navbar">
          <div className="noticias-nav-brand" onClick={() => onSwitch("feed")}>Street Paws</div>
          <div className="noticias-nav-links">
            <span onClick={() => onSwitch("feed")}>Inicio</span>
            <span onClick={() => onSwitch("explorar")}>Explorar</span>
            <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
          </div>
          <button className="noticias-back-btn" onClick={() => onSwitch("feed")}>← Volver</button>
        </nav>
        <div className="noticias-container">
          <div className="noticias-empty">
            <span>📰</span>
            <p>No hay noticias disponibles por el momento</p>
          </div>
        </div>
      </div>
    );
  }

  // Primera noticia como featured, el resto en el grid
  const [featured, ...resto] = noticias;

  // Imagen predeterminada cuando la original falla o no existe
  const IMG_FALLBACK = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80";
  const handleImgError = (e) => { e.target.src = IMG_FALLBACK; };

  return (
    <div style={{ background: 'var(--cream, #faf7f3)', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="noticias-navbar">
        <div className="noticias-nav-brand" onClick={() => onSwitch("feed")}>Street Paws</div>
        <div className="noticias-nav-links">
          <span onClick={() => onSwitch("feed")}>Inicio</span>
          <span onClick={() => onSwitch("explorar")}>Explorar</span>
          <span onClick={() => onSwitch("adopciones")}>Adopciones</span>
        </div>
        <button className="noticias-back-btn" onClick={() => onSwitch("feed")}>← Volver</button>
      </nav>

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
          <img
            src={featured.image || IMG_FALLBACK}
            alt={featured.title}
            onError={handleImgError}
          />
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
                <img
                  src={n.image || IMG_FALLBACK}
                  alt={n.title}
                  onError={handleImgError}
                />
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
    </div>
  );
}

export default Noticias;