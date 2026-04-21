import { useState, useEffect } from "react";
import "./Adopciones.css";
import Mascotas from "../mascotas/Mascotas";

const URL_MASCOTAS =
  "https://proyectosena-production-4ad5.up.railway.app/api/mascotas";
const URL_SOLICITUDES =
  "https://proyectosena-production-4ad5.up.railway.app/api/solicitudes";
const URL_FAVORITOS =
  "https://proyectosena-production-4ad5.up.railway.app/api/favoritos";
const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";

const ESPECIES = ["Todos", "Perro", "Gato"];
const EDADES = [
  "Todos",
  "Cachorro (0-1 año)",
  "Joven (1-3 años)",
  "Adulto (3-7 años)",
  "Adulto mayor (+7 años)",
];
const TAMANIOS = ["Todos", "Pequeño", "Mediano", "Grande"];
const GENEROS = ["Todos", "Macho", "Hembra"];

const ESTADO_BADGE = {
  disponible: { label: "Disponible", cls: "badge--disponible" },
  adoptado: { label: "Adoptado", cls: "badge--adoptado" },
  en_proceso: { label: "En proceso", cls: "badge--proceso" },
  "en proceso": { label: "En proceso", cls: "badge--proceso" },
};

function Adopciones({ onSwitch, user }) {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("Todos");
  const [filtroEdad, setFiltroEdad] = useState("Todos");
  const [filtroTamanio, setFiltroTamanio] = useState("Todos");
  const [filtroGenero, setFiltroGenero] = useState("Todos");
  const [favoritos, setFavoritos] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [modalSolicitud, setModalSolicitud] = useState(null);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  // Tab por defecto: "mascotas" para admin
  const [tabAdmin, setTabAdmin] = useState("mascotas");

  const token = localStorage.getItem("token");
  const esAdmin = user?.rol === 2;

  useEffect(() => {
    cargarMascotas();
    if (token) {
      cargarIdsFavoritos();
      cargarUsuarioActual();
    }
  }, []);

  useEffect(() => {
    if (esAdmin) cargarSolicitudes();
  }, [user]);

  useEffect(() => {
    const cerrar = () => setMenuAvatarAbierto(false);
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const cargarMascotas = async () => {
    setLoading(true);
    try {
      const res = await fetch(URL_MASCOTAS);
      const data = await res.json();
      setMascotas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarIdsFavoritos = async () => {
    try {
      const res = await fetch(`${URL_FAVORITOS}/ids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavoritos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando favoritos:", err);
    }
  };

  const cargarUsuarioActual = async () => {
    try {
      const res = await fetch(`${URL_PROFILE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarioActual(data);
    } catch (error) {
      console.error("Error cargando usuario:", error);
    }
  };

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const res = await fetch(URL_SOLICITUDES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    } finally {
      setLoadingSolicitudes(false);
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
      if (estado === "Aceptada") cargarMascotas();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la solicitud");
    }
  };

  const toggleFavorito = async (id_mascota) => {
    if (!token) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }
    setTogglingId(id_mascota);
    try {
      const res = await fetch(`${URL_FAVORITOS}/${id_mascota}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavoritos((prev) =>
        data.accion === "agregado"
          ? [...prev, id_mascota]
          : prev.filter((id) => id !== id_mascota),
      );
    } catch (err) {
      console.error("Error toggle favorito:", err);
    } finally {
      setTimeout(() => setTogglingId(null), 300);
    }
  };

  const clasificarEdad = (edad) => {
    if (edad <= 1) return "Cachorro (0-1 año)";
    if (edad <= 3) return "Joven (1-3 años)";
    if (edad <= 7) return "Adulto (3-7 años)";
    return "Adulto mayor (+7 años)";
  };

  const getEdadTexto = (edad) => {
    if (!edad && edad !== 0) return "Edad desconocida";
    if (edad === 0) return "Menos de 1 año";
    return `${edad} año${edad !== 1 ? "s" : ""}`;
  };

  const getBadge = (estado) => {
    const key = estado?.toLowerCase() || "";
    return (
      ESTADO_BADGE[key] || {
        label: estado || "Desconocido",
        cls: "badge--otro",
      }
    );
  };

  const mascotasFiltradas = mascotas.filter((m) => {
    const txt = busqueda.toLowerCase();
    return (
      (!busqueda ||
        m.nombre?.toLowerCase().includes(txt) ||
        m.raza?.toLowerCase().includes(txt) ||
        m.especie?.toLowerCase().includes(txt)) &&
      (filtroEspecie === "Todos" ||
        m.especie?.toLowerCase() === filtroEspecie.toLowerCase()) &&
      (filtroEdad === "Todos" || clasificarEdad(m.edad) === filtroEdad) &&
      (filtroTamanio === "Todos" ||
        m.tamanio?.toLowerCase() === filtroTamanio.toLowerCase()) &&
      (filtroGenero === "Todos" ||
        m.sexo?.toLowerCase() === filtroGenero.toLowerCase())
    );
  });

  const mascotasOrdenadas = [
    ...mascotasFiltradas.filter(
      (m) => m.estado_adopcion?.toLowerCase() === "disponible",
    ),
    ...mascotasFiltradas.filter(
      (m) => m.estado_adopcion?.toLowerCase() !== "disponible",
    ),
  ];

  const enviarSolicitud = async () => {
    if (!modalSolicitud) return;
    setEnviando(true);
    try {
      const res = await fetch(URL_SOLICITUDES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_mascota: modalSolicitud.id_mascota,
          notas: notas || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "No se pudo enviar");
        return;
      }
      setExito(true);
      setTimeout(() => {
        setModalSolicitud(null);
        setNotas("");
        setExito(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="top-navbar">
        <div className="nav-brand">Street Paws</div>
        <div className="nav-links">
          <span onClick={() => onSwitch("feed")}>Inicio</span>
          <span onClick={() => onSwitch("explorar")}>Explorar</span>
          <span className="active">Adopciones</span>
        </div>
        <div className="nav-search">
          <div
            className="nav-avatar-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAvatarAbierto((v) => !v);
            }}
          >
            <div className="nav-avatar">
              {usuarioActual?.foto_perfil ? (
                <img
                  src={usuarioActual.foto_perfil}
                  alt={usuarioActual.nombre}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                usuarioActual?.nombre?.charAt(0) || "U"
              )}
            </div>
            {menuAvatarAbierto && (
              <div className="dropdown-avatar">
                <div className="dropdown-avatar-divider" />
                <button onClick={() => onSwitch("perfil")}>👤 Mi perfil</button>
                <button onClick={() => onSwitch("configuracion")}>
                  ⚙️ Configuración
                </button>
                <div className="dropdown-avatar-divider" />
                <button
                  className="dropdown-avatar-logout"
                  onClick={() => {
                    localStorage.removeItem("token");
                    onSwitch("login");
                  }}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Tabs solo para admin ── */}
      {esAdmin && (
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tabAdmin === "mascotas" ? "admin-tab--active" : ""}`}
            onClick={() => setTabAdmin("mascotas")}
          >
            🐾 Mascotas
          </button>
          <button
            className={`admin-tab ${tabAdmin === "solicitudes" ? "admin-tab--active" : ""}`}
            onClick={() => {
              setTabAdmin("solicitudes");
              cargarSolicitudes();
            }}
          >
            📋 Solicitudes de adopción
          </button>
        </div>
      )}

      {/* ── Modal detalle mascota ── */}
      {mascotaSeleccionada && (
        <div
          className="adopt-modal-overlay"
          onClick={() => setMascotaSeleccionada(null)}
        >
          <div
            className="adopt-modal-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="adopt-modal-close"
              onClick={() => setMascotaSeleccionada(null)}
            >
              ✕
            </button>
            <div className="adopt-modal-img-wrap">
              {mascotaSeleccionada.fotos?.[0]?.url_foto ? (
                <img
                  src={mascotaSeleccionada.fotos[0].url_foto}
                  alt={mascotaSeleccionada.nombre}
                />
              ) : (
                <div className="adopt-modal-img-placeholder">🐾</div>
              )}
              <span
                className={`adopt-badge-modal ${getBadge(mascotaSeleccionada.estado_adopcion).cls}`}
              >
                {getBadge(mascotaSeleccionada.estado_adopcion).label}
              </span>
            </div>
            <div className="adopt-modal-info">
              <h2>{mascotaSeleccionada.nombre}</h2>
              <p className="adopt-modal-sub">
                {getEdadTexto(mascotaSeleccionada.edad)} ·{" "}
                {mascotaSeleccionada.raza}
              </p>
              <div className="adopt-modal-tags">
                <span>🐾 {mascotaSeleccionada.especie}</span>
                <span>⚕️ {mascotaSeleccionada.estado_salud}</span>
                {mascotaSeleccionada.sexo && (
                  <span>
                    {mascotaSeleccionada.sexo === "Macho" ? "♂️" : "♀️"}{" "}
                    {mascotaSeleccionada.sexo}
                  </span>
                )}
              </div>
              {mascotaSeleccionada.estado_adopcion?.toLowerCase() ===
                "disponible" && (
                <button
                  className="btn-adoptar-modal"
                  onClick={() => {
                    setMascotaSeleccionada(null);
                    setModalSolicitud(mascotaSeleccionada);
                  }}
                >
                  Quiero adoptarme 🐾
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal solicitud ── */}
      {modalSolicitud && (
        <div
          className="adopt-modal-overlay"
          onClick={() => {
            setModalSolicitud(null);
            setNotas("");
            setExito(false);
          }}
        >
          <div
            className="adopt-modal-solicitud"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="adopt-modal-close"
              onClick={() => {
                setModalSolicitud(null);
                setNotas("");
                setExito(false);
              }}
            >
              ✕
            </button>
            {exito ? (
              <div className="solicitud-exito">
                <div className="exito-icon">🐾</div>
                <h3>¡Solicitud enviada!</h3>
                <p>
                  Pronto nos pondremos en contacto sobre{" "}
                  <strong>{modalSolicitud.nombre}</strong>.
                </p>
              </div>
            ) : (
              <>
                <h2>Solicitar adopción</h2>
                <div className="solicitud-mascota-preview">
                  <div className="solicitud-avatar">
                    {modalSolicitud.fotos?.[0]?.url_foto ? (
                      <img
                        src={modalSolicitud.fotos[0].url_foto}
                        alt={modalSolicitud.nombre}
                      />
                    ) : (
                      <span>🐾</span>
                    )}
                  </div>
                  <div>
                    <strong>{modalSolicitud.nombre}</strong>
                    <span>
                      {modalSolicitud.raza} ·{" "}
                      {getEdadTexto(modalSolicitud.edad)}
                    </span>
                  </div>
                </div>
                <label>
                  ¿Algo que quieras contarnos? <span>(opcional)</span>
                </label>
                <textarea
                  placeholder="Cuéntanos sobre tu hogar..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={4}
                />
                <div className="solicitud-actions">
                  <button
                    className="btn-cancelar-solicitud"
                    onClick={() => {
                      setModalSolicitud(null);
                      setNotas("");
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-enviar-solicitud"
                    onClick={enviarSolicitud}
                    disabled={enviando}
                  >
                    {enviando ? (
                      <span className="spinner" />
                    ) : (
                      "Enviar solicitud"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          VISTAS ADMIN
      ══════════════════════════════════════════ */}

      {/* Tab admin: Mascotas (CRUD embebido) */}
      {esAdmin && tabAdmin === "mascotas" && (
        <Mascotas onSwitch={onSwitch} user={user} embebido={true} />
      )}

      {/* Tab admin: Solicitudes */}
      {esAdmin && tabAdmin === "solicitudes" && (
        <div className="admin-solicitudes">
          <h2>Solicitudes de Adopción</h2>

          {loadingSolicitudes ? (
            <div className="adopt-loading">
              <div className="adopt-spinner" />
              <p>Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <p className="adopt-empty-text">No hay solicitudes registradas.</p>
          ) : (
            <div className="tabla-container">
              <table className="tabla-solicitudes">
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
                      <td>
                        {new Date(sol.fecha_solicitud).toLocaleDateString()}
                      </td>
                      <td>{sol.notas || "-"}</td>

                      <td>
                        <span
                          className={`badge-estado badge-${sol.estado?.toLowerCase()}`}
                        >
                          {sol.estado}
                        </span>
                      </td>

                      <td>
                        {sol.estado === "Pendiente" ? (
                          <>
                            <button
                              className="btn-aceptar"
                              onClick={() =>
                                gestionarSolicitud(sol.id_solicitud, "Aceptada")
                              }
                            >
                              Aceptar
                            </button>

                            <button
                              className="btn-rechazar"
                              onClick={() =>
                                gestionarSolicitud(
                                  sol.id_solicitud,
                                  "Rechazada",
                                )
                              }
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="estado-final">
                            {sol.estado === "Aceptada"
                              ? "Aceptado"
                              : "Rechazado"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          VISTA USUARIO NORMAL
      ══════════════════════════════════════════ */}

      {!esAdmin && (
        <>
          {/* Hero */}
          <section className="adopt-hero">
            <div className="adopt-hero-overlay" />
            <div className="adopt-hero-content">
              <h1>
                Encuentra a tu alma
                <br />
                gemela peluda
              </h1>
              <p>
                Cada animal merece una segunda oportunidad. Dale un hogar
                definitivo a una mascota de la calle hoy y siente el amor
                incondicional.
              </p>
              <div className="adopt-search-bar">
                <span className="adopt-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, raza o ubicación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <button>Buscar</button>
              </div>
            </div>
          </section>

          <div className="adopt-page">
            <div className="adopt-filters-bar">
              <h2>Mascotas en Adopción</h2>
              <div className="adopt-filters-group">
                <FilterDropdown
                  label="Especie"
                  options={ESPECIES}
                  value={filtroEspecie}
                  onChange={setFiltroEspecie}
                />
                <FilterDropdown
                  label="Edad"
                  options={EDADES}
                  value={filtroEdad}
                  onChange={setFiltroEdad}
                />
                <FilterDropdown
                  label="Tamaño"
                  options={TAMANIOS}
                  value={filtroTamanio}
                  onChange={setFiltroTamanio}
                />
                <FilterDropdown
                  label="Género"
                  options={GENEROS}
                  value={filtroGenero}
                  onChange={setFiltroGenero}
                />
              </div>
            </div>

            {loading ? (
              <div className="adopt-loading">
                <div className="adopt-spinner" />
                <p>Cargando mascotas...</p>
              </div>
            ) : mascotasOrdenadas.length === 0 ? (
              <div className="adopt-empty">
                <span>🐾</span>
                <p>No se encontraron mascotas con esos filtros</p>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroEspecie("Todos");
                    setFiltroEdad("Todos");
                    setFiltroTamanio("Todos");
                    setFiltroGenero("Todos");
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="adopt-grid">
                {mascotasOrdenadas.map((mascota) => {
                  const disponible =
                    mascota.estado_adopcion?.toLowerCase() === "disponible";
                  const esFavorito = favoritos.includes(mascota.id_mascota);
                  const badge = getBadge(mascota.estado_adopcion);
                  return (
                    <div
                      className={`adopt-card ${!disponible ? "adopt-card--nodisponible" : ""}`}
                      key={mascota.id_mascota}
                    >
                      <div className="adopt-card-img-wrap">
                        {mascota.fotos?.[0]?.url_foto ? (
                          <img
                            src={mascota.fotos[0].url_foto}
                            alt={mascota.nombre}
                            className="adopt-card-img"
                          />
                        ) : (
                          <div className="adopt-card-img-placeholder">🐾</div>
                        )}
                        <button
                          className={`adopt-card-heart ${esFavorito ? "adopt-card-heart--active" : ""} ${togglingId === mascota.id_mascota ? "adopt-card-heart--toggling" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorito(mascota.id_mascota);
                          }}
                        >
                          {esFavorito ? "❤️" : "🤍"}
                        </button>
                        <span
                          className={`adopt-card-status-badge ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="adopt-card-body">
                        <h3>{mascota.nombre}</h3>
                        <p className="adopt-card-meta">
                          {getEdadTexto(mascota.edad)} · {mascota.raza}
                        </p>
                        <div className="adopt-card-actions">
                          <button
                            className="btn-adoptar"
                            disabled={!disponible}
                            onClick={() =>
                              disponible && setModalSolicitud(mascota)
                            }
                          >
                            Adoptar
                          </button>
                          <button
                            className="btn-info"
                            onClick={() => setMascotaSeleccionada(mascota)}
                          >
                            Info
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {mascotasOrdenadas.length > 0 && (
              <div className="adopt-filters-bar adopt-filters-bar--bottom">
                <div className="adopt-filters-group">
                  <FilterDropdown
                    label="Especie"
                    options={ESPECIES}
                    value={filtroEspecie}
                    onChange={setFiltroEspecie}
                  />
                  <FilterDropdown
                    label="Edad"
                    options={EDADES}
                    value={filtroEdad}
                    onChange={setFiltroEdad}
                  />
                  <FilterDropdown
                    label="Tamaño"
                    options={TAMANIOS}
                    value={filtroTamanio}
                    onChange={setFiltroTamanio}
                  />
                  <FilterDropdown
                    label="Género"
                    options={GENEROS}
                    value={filtroGenero}
                    onChange={setFiltroGenero}
                  />
                </div>
                <button className="adopt-next-btn">›</button>
              </div>
            )}
          </div>

          <footer className="adopt-footer">
            <div className="adopt-footer-inner">
              <div className="adopt-footer-brand">
                <span className="footer-brand-icon">🐾</span>
                <strong>Street Paws</strong>
                <p>
                  Ayudando a los animales de la calle a encontrar hogares
                  amorosos.
                </p>
                <div className="footer-social">
                  <button>↗</button>
                  <button>♡</button>
                  <button>✉</button>
                </div>
              </div>
              <div className="adopt-footer-links">
                <div>
                  <h4>Compañía</h4>
                  <span>Sobre Nosotros</span>
                  <span>Contacto</span>
                  <span>Nuestro Equipo</span>
                </div>
                <div>
                  <h4>Ayuda</h4>
                  <span>Proceso de Adopción</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const isActive = value !== "Todos";
  return (
    <div
      className={`filter-dropdown ${isActive ? "filter-dropdown--active" : ""}`}
    >
      <button
        className="filter-dropdown-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {isActive ? value : label}{" "}
        <span className="filter-dropdown-arrow">▾</span>
      </button>
      {open && (
        <div
          className="filter-dropdown-menu"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <div
              key={opt}
              className={`filter-dropdown-item ${value === opt ? "selected" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Adopciones;
