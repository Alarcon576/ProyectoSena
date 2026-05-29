import { useEffect, useState } from "react";

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
      const res = await fetch(URL);
      const data = await res.json();

      setNoticias(data);
    } catch (error) {
      console.error(error);
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
            <img src={n.image} alt={n.title} />

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