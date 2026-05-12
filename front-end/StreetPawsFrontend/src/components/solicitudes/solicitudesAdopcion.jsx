import { useState, useEffect } from "react";
import "./solicitudesAdopcion.css";

const URL_SOLICITUDES =
  "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";

function TablaSolicitudes({ token }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const res = await fetch(URL_SOLICITUDES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    } finally {
      setLoading(false);
    }
  };

  const gestionarSolicitud = async (id, estado) => {
    try {
      const res = await fetch(`${URL_SOLICITUDES}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      cargarSolicitudes();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la solicitud");
    }
  };

  if (loading) {
    return (
      <div className="ts-loading">
        <div className="ts-spinner" />
        <p>Cargando solicitudes...</p>
      </div>
    );
  }

  if (solicitudes.length === 0) {
    return <p className="ts-empty-text">No hay solicitudes registradas.</p>;
  }

  return (
    <div className="ts-container">
      {/* ── Tabla escritorio ── */}
      <div className="ts-table-wrapper">
        <table className="ts-table">
          <thead>
            <tr>
              <th>Mascota</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Detalles</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((sol) => (
              <tr key={sol.id_solicitud}>
                <td>{sol.mascota?.nombre || `#${sol.id_mascota}`}</td>
                <td>{sol.usuario?.nombre || `#${sol.id_usuario}`}</td>
                <td>{new Date(sol.fecha_solicitud).toLocaleDateString()}</td>
                <td>{sol.notas || "-"}</td>
                <td>
                  <span
                    className={`ts-badge ts-badge--${sol.estado?.toLowerCase()}`}
                  >
                    {sol.estado}
                  </span>
                </td>
                <td>
                  {sol.estado === "Pendiente" ? (
                    <>
                      <button
                        className="ts-btn ts-btn--aceptar"
                        onClick={() =>
                          gestionarSolicitud(sol.id_solicitud, "Aceptada")
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        className="ts-btn ts-btn--rechazar"
                        onClick={() =>
                          gestionarSolicitud(sol.id_solicitud, "Rechazada")
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <span className="ts-estado-final">
                      {sol.estado === "Aceptada" ? "Aceptado" : "Rechazado"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Cards móvil ── */}
      <div className="ts-cards-mobile">
        {solicitudes.map((sol) => (
          <div key={sol.id_solicitud} className="ts-card">
            <div className="ts-card-header">
              <div className="ts-card-avatar">
                {sol.mascota?.fotos?.[0]?.url_foto ? (
                  <img
                    src={sol.mascota.fotos[0].url_foto}
                    alt={sol.mascota.nombre}
                  />
                ) : (
                  "🐾"
                )}
              </div>
              <div className="ts-card-title">
                <strong>{sol.mascota?.nombre || `#${sol.id_mascota}`}</strong>
                <span>{sol.usuario?.nombre || `#${sol.id_usuario}`}</span>
              </div>
              <span
                className={`ts-badge ts-badge--${sol.estado?.toLowerCase()}`}
              >
                {sol.estado}
              </span>
            </div>

            <div className="ts-card-meta">
              <div className="ts-card-meta-item">
                <span className="ts-card-meta-label">Fecha:</span>
                {new Date(sol.fecha_solicitud).toLocaleDateString()}
              </div>
              {sol.notas && (
                <div className="ts-card-meta-item">
                  <span className="ts-card-meta-label">Nota:</span>
                  {sol.notas}
                </div>
              )}
            </div>

            {sol.estado === "Pendiente" && (
              <div className="ts-card-footer">
                <button
                  className="ts-btn ts-btn--aceptar"
                  onClick={() =>
                    gestionarSolicitud(sol.id_solicitud, "Aceptada")
                  }
                >
                  Aceptar
                </button>
                <button
                  className="ts-btn ts-btn--rechazar"
                  onClick={() =>
                    gestionarSolicitud(sol.id_solicitud, "Rechazada")
                  }
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TablaSolicitudes;
