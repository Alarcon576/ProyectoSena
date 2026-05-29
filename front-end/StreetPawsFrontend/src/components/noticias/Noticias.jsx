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

      if (!res.ok) {
        throw new Error("Error obteniendo noticias");
      }

      const data = await res.json();

      setNoticias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando noticias...</p>;
  }

  return (
    <div className="noticias-container">
      <h2>📰 Noticias de Mascotas</h2>

      <div className="noticias-grid">
        {noticias.map((n, index) => (
          <div className="noticia-card" key={index}>
            {n.image && (
              <img
                src={n.image}
                alt={n.title}
              />
            )}

            <h3>{n.title}</h3>

            <p>{n.description}</p>

            <a
              href={n.url}
              target="_blank"
              rel="noreferrer"
            >
              Leer noticia →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Noticias;