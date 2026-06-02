import { useState, useEffect } from "react";
import "./solicitudesAdopcion.css";

const URL_SOLICITUDES =
  "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";

/* ════════════════════════════════════════
   Modal — Formulario de solo lectura
════════════════════════════════════════ */
function ModalVerFormulario({ solicitud, onClose }) {
  if (!solicitud) return null;

  const mascota = solicitud.mascota;

  const getEdadTexto = (edad) => {
    if (!edad && edad !== 0) return "";
    if (edad < 12) return `${edad} ${edad === 1 ? "mes" : "meses"}`;
    const años = Math.floor(edad / 12);
    return `${años} ${años === 1 ? "año" : "años"}`;
  };

  return (
    <div className="adopt-modal-overlay" onClick={onClose}>
      <div
        className="adopt-modal-solicitud formulario-adopcion vf-readonly"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button className="adopt-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Insignia solo lectura */}
        <div className="vf-readonly-badge">
          <span>👁 Solo lectura</span>
        </div>

        <h2>Formulario de Adopción</h2>

        {/* Preview mascota */}
        <div className="solicitud-mascota-preview">
          <div className="solicitud-avatar">
            {mascota?.fotos?.[0]?.url_foto ? (
              <img src={mascota.fotos[0].url_foto} alt={mascota.nombre} />
            ) : (
              <span>🐾</span>
            )}
          </div>
          <div>
            <strong>{mascota?.nombre || `#${solicitud.id_mascota}`}</strong>
            <span>
              {mascota?.raza}
              {mascota?.edad !== undefined
                ? ` · ${getEdadTexto(mascota.edad)}`
                : ""}
            </span>
          </div>
          {/* Badge estado */}
          <span
            className={`ts-badge ts-badge--${solicitud.estado?.toLowerCase()} vf-estado-badge`}
          >
            {solicitud.estado}
          </span>
        </div>

        {/* Grid de campos — idéntico al formulario original, todos disabled */}
        <div className="formulario-grid">
          <div className="input-group">
            <label>Nombre completo</label>
            <input
              type="text"
              value={solicitud.nombre_completo || ""}
              disabled
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={solicitud.telefono || ""}
              disabled
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={solicitud.correo || ""}
              disabled
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Dirección</label>
            <input
              type="text"
              value={solicitud.direccion || ""}
              disabled
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Tipo de vivienda</label>
            <select value={solicitud.tipo_vivienda || ""} disabled>
              <option value="">Selecciona</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Finca">Finca</option>
            </select>
          </div>

          <div className="input-group full-width">
            <label>¿Has tenido mascotas antes?</label>
            <textarea
              rows={3}
              value={solicitud.experiencia_mascotas || ""}
              disabled
              readOnly
            />
          </div>

          <div className="input-group full-width">
            <label>¿Por qué deseas adoptar?</label>
            <textarea
              rows={4}
              value={solicitud.motivo_adopcion || ""}
              disabled
              readOnly
            />
          </div>

          {/* Notas de la solicitud si existen */}
          {solicitud.notas && (
            <div className="input-group full-width">
              <label>Notas adicionales</label>
              <textarea rows={2} value={solicitud.notas} disabled readOnly />
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="solicitud-actions">
          <span className="vf-fecha-envio">
            📅 Enviado el{" "}
            {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <button className="btn-cancelar-solicitud" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Componente principal
════════════════════════════════════════ */
function TablaSolicitudes({ token }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [solicitudVista, setSolicitudVista] = useState(null);

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
    <>
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

                  {/* ── Columna Detalles ── */}
                  <td>
                    <button
                      className="ts-btn-ver-formulario"
                      onClick={() => setSolicitudVista(sol)}
                    >
                      <span className="ts-btn-ver-icon">📋</span> Formulario
                    </button>
                  </td>

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
              </div>

              <button
                className="ts-btn-ver-formulario ts-btn-ver-formulario--full"
                onClick={() => setSolicitudVista(sol)}
              >
                <span className="ts-btn-ver-icon">📋</span> Ver formulario
              </button>

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

      {/* Modal global */}
      {solicitudVista && (
        <ModalVerFormulario
          solicitud={solicitudVista}
          onClose={() => setSolicitudVista(null)}
        />
      )}
    </>
  );
}

export default TablaSolicitudes;
