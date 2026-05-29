import { useState } from "react";

const URL_SOLICITUDES =
  "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";

function ModalSolicitudAdopcion({ mascota, token, onClose, getEdadTexto }) {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    telefono: "",
    correo: "",
    direccion: "",
    tipo_vivienda: "",
    experiencia_mascotas: "",
    motivo_adopcion: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleClose = () => {
    setFormData({
      nombre_completo: "",
      telefono: "",
      correo: "",
      direccion: "",
      tipo_vivienda: "",
      experiencia_mascotas: "",
      motivo_adopcion: "",
    });

    setExito(false);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const enviarSolicitud = async () => {
    if (!mascota) return;

    setEnviando(true);

    try {
      const res = await fetch(URL_SOLICITUDES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_mascota: mascota.id_mascota,
          ...formData,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "No se pudo enviar la solicitud");
        return;
      }

      setExito(true);

      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch {
      alert("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  if (!mascota) return null;

  return (
    <div className="adopt-modal-overlay" onClick={handleClose}>
      <div
        className="adopt-modal-solicitud formulario-adopcion"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="adopt-modal-close" onClick={handleClose}>
          ✕
        </button>

        {exito ? (
          <div className="solicitud-exito">
            <div className="exito-icon">🐾</div>

            <h3>¡Formulario enviado!</h3>

            <p>
              Tu solicitud para adoptar a <strong>{mascota.nombre}</strong> fue
              enviada correctamente.
            </p>
          </div>
        ) : (
          <>
            <h2>Formulario de Adopción</h2>

            <div className="solicitud-mascota-preview">
              <div className="solicitud-avatar">
                {mascota.fotos?.[0]?.url_foto ? (
                  <img src={mascota.fotos[0].url_foto} alt={mascota.nombre} />
                ) : (
                  <span>🐾</span>
                )}
              </div>

              <div>
                <strong>{mascota.nombre}</strong>

                <span>
                  {mascota.raza} · {getEdadTexto(mascota.edad)}
                </span>
              </div>
            </div>

            <div className="formulario-grid">
              <div className="input-group">
                <label>Nombre completo</label>

                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre"
                />
              </div>

              <div className="input-group">
                <label>Teléfono</label>

                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Número de contacto"
                />
              </div>

              <div className="input-group">
                <label>Correo electrónico</label>

                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@gmail.com"
                />
              </div>

              <div className="input-group">
                <label>Dirección</label>

                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Tu dirección"
                />
              </div>

              <div className="input-group">
                <label>Tipo de vivienda</label>

                <select
                  name="tipo_vivienda"
                  value={formData.tipo_vivienda}
                  onChange={handleChange}
                >
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
                  name="experiencia_mascotas"
                  value={formData.experiencia_mascotas}
                  onChange={handleChange}
                  placeholder="Cuéntanos tu experiencia..."
                />
              </div>

              <div className="input-group full-width">
                <label>¿Por qué deseas adoptar?</label>

                <textarea
                  rows={4}
                  name="motivo_adopcion"
                  value={formData.motivo_adopcion}
                  onChange={handleChange}
                  placeholder="Escribe tu motivo..."
                />
              </div>
            </div>

            <div className="solicitud-actions">
              <button className="btn-cancelar-solicitud" onClick={handleClose}>
                Cancelar
              </button>

              <button
                className="btn-enviar-solicitud"
                onClick={enviarSolicitud}
                disabled={enviando}
              >
                {enviando ? <span className="spinner" /> : "Enviar formulario"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalSolicitudAdopcion;
