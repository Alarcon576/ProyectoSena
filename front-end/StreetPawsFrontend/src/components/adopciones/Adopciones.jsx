import { useState, useEffect } from "react";
import "./Adopciones.css";
import Mascotas from "../mascotas/Mascotas";
import SolicitudesAdopcion from "../solicitudes/solicitudesAdopcion";
import ModalSolicitudAdopcion from "./AdopcionesForm"; 

const URL_MASCOTAS  = "https://proyectosena-production-4ad5.up.railway.app/api/mascotas";
const URL_PROFILE   = "https://proyectosena-production-4ad5.up.railway.app/api/profile";

const ESPECIES = ["Todos","Perro","Gato"];
const EDADES   = ["Todos","Cachorro (0-1 año)","Joven (1-3 años)","Adulto (3-7 años)","Adulto mayor (+7 años)"];
const GENEROS  = ["Todos","Macho","Hembra"];

const ESTADO_INFO = {
  disponible:    { label: "Busca hogar 🐾",     cls: "badge--disponible" },
  adoptado:      { label: "Ya tiene familia 💙", cls: "badge--adoptado"  },
  en_proceso:    { label: "En proceso ✨",        cls: "badge--proceso"   },
  "en proceso":  { label: "En proceso ✨",        cls: "badge--proceso"   },
};

const TEXTO_BTN_NO_DISPONIBLE = {
  adoptado:     "¡Ya fue adoptado! 🎉",
  en_proceso:   "En proceso 🤞",
  "en proceso": "En proceso 🤞",
};

/* ── Pasos del proceso de adopción ── */
const PASOS_ADOPCION = [
  {
    num: "01",
    titulo: "Elige tu compañero",
    desc: "Explora las mascotas disponibles y encuentra la que conecte contigo. Puedes filtrar por especie, edad y género.",
    icon: "🐾",
  },
  {
    num: "02",
    titulo: "Llena el formulario",
    desc: "Completa el formulario de adopción con tus datos personales, tipo de vivienda y experiencia con mascotas. Es rápido y sencillo.",
    icon: "📋",
  },
  {
    num: "03",
    titulo: "Street Paws te contacta",
    desc: "Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo para conocerte mejor y resolver tus dudas.",
    icon: "📞",
  },
  {
    num: "04",
    titulo: "Decisión final",
    desc: "Evaluamos si el hogar es el adecuado para la mascota. Si todo va bien, ¡tu nuevo amigo estará listo para irse a casa contigo!",
    icon: "🏠",
  },
];

function Adopciones({ onSwitch, user }) {
  const [mascotas, setMascotas]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [filtroEspecie, setFiltroEspecie]   = useState("Todos");
  const [filtroEdad, setFiltroEdad]         = useState("Todos");
  const [filtroTamanio, setFiltroTamanio]   = useState("Todos");
  const [filtroGenero, setFiltroGenero]     = useState("Todos");
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [modalSolicitud, setModalSolicitud] = useState(null);
  const [modalProceso, setModalProceso]     = useState(false);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [usuarioActual, setUsuarioActual]   = useState(null);
  const [tabAdmin, setTabAdmin]   = useState("mascotas");

  const token   = localStorage.getItem("token");
  const esAdmin = user?.rol === 2;

  const hayFiltros = busqueda || filtroEspecie !== "Todos" || filtroEdad !== "Todos"
    || filtroTamanio !== "Todos" || filtroGenero !== "Todos";

  const limpiarFiltros = () => {
    setBusqueda(""); setFiltroEspecie("Todos");
    setFiltroEdad("Todos"); setFiltroGenero("Todos");
  };

  useEffect(() => {
    cargarMascotas();
    if (token) cargarUsuarioActual();
  }, []);

  useEffect(() => {
    const c = () => setMenuAvatarAbierto(false);
    document.addEventListener("click", c);
    return () => document.removeEventListener("click", c);
  }, []);

  const cargarMascotas = async () => {
    try {
      setLoading(true);
      const res  = await fetch(URL_MASCOTAS);
      const data = await res.json();
      setMascotas(Array.isArray(data) ? data : []);
    } catch (error) { console.error("ERROR:", error); }
    finally { setLoading(false); }
  };

  const cargarUsuarioActual = async () => {
    try {
      const res = await fetch(`${URL_PROFILE}/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUsuarioActual(await res.json());
    } catch {}
  };

  const clasificarEdad = e =>
    e <= 1 ? "Cachorro (0-1 año)" : e <= 3 ? "Joven (1-3 años)" : e <= 7 ? "Adulto (3-7 años)" : "Adulto mayor (+7 años)";

  const getEdadTexto = e =>
    (!e && e !== 0) ? "Edad desconocida" : e === 0 ? "Menos de 1 año" : `${e} año${e !== 1 ? "s" : ""}`;

  const getBadge = estado => {
    const k = estado?.toLowerCase() || "";
    return ESTADO_INFO[k] || { label: estado || "Desconocido", cls: "badge--otro" };
  };

  const getBtnTexto = (disponible, estado) => {
    if (disponible) return "Adoptame 🐾";
    const k = estado?.toLowerCase() || "";
    return TEXTO_BTN_NO_DISPONIBLE[k] || "Momentáneamente no disponible";
  };

  const mascotasFiltradas = mascotas.filter(m => {
    const txt = busqueda.toLowerCase();
    return (
      (!busqueda || m.nombre?.toLowerCase().includes(txt) || m.raza?.toLowerCase().includes(txt) || m.especie?.toLowerCase().includes(txt)) &&
      (filtroEspecie === "Todos" || m.especie?.toLowerCase() === filtroEspecie.toLowerCase()) &&
      (filtroEdad === "Todos" || clasificarEdad(m.edad) === filtroEdad) &&
      (filtroTamanio === "Todos" || m.tamanio?.toLowerCase() === filtroTamanio.toLowerCase()) &&
      (filtroGenero === "Todos" || m.sexo?.toLowerCase() === filtroGenero.toLowerCase())
    );
  });

  const mascotasOrdenadas = esAdmin
    ? mascotasFiltradas
    : mascotasFiltradas.filter(m => m.estado_adopcion?.toLowerCase().trim() === "disponible");

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="ad-navbar">
        <div className="ad-nav-brand" onClick={() => onSwitch("feed")}>Street Paws</div>
        <div className="ad-nav-links">
          <span onClick={() => onSwitch("feed")}>Inicio</span>
          <span onClick={() => onSwitch("explorar")}>Explorar</span>
          <span className="active">Adopciones</span>
        </div>
        <div className="ad-nav-right">
          <div className="ad-nav-avatar-wrapper" onClick={e => { e.stopPropagation(); setMenuAvatarAbierto(v => !v); }}>
            <div className="ad-nav-avatar">
              {usuarioActual?.foto_perfil ? (
                <img src={usuarioActual.foto_perfil} alt={usuarioActual.nombre} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
              ) : ( usuarioActual?.nombre?.charAt(0) || "U" )}
            </div>
            {menuAvatarAbierto && (
              <div className="ad-dropdown-avatar">
                <div className="ad-dropdown-header">
                  <span className="ad-dropdown-nombre">{usuarioActual?.nombre || "Usuario"}</span>
                  <span className="ad-dropdown-email">{usuarioActual?.email || ""}</span>
                </div>
                <div className="ad-dropdown-divider" />
                <button onClick={e => { e.stopPropagation(); setMenuAvatarAbierto(false); onSwitch("perfil"); }}>👤 Mi perfil</button>
                <button onClick={e => { e.stopPropagation(); setMenuAvatarAbierto(false); onSwitch("configuracion"); }}>⚙️ Configuración</button>
                <div className="ad-dropdown-divider" />
                <button className="ad-dropdown-logout" onClick={e => { e.stopPropagation(); localStorage.removeItem("token"); onSwitch("login"); }}>🚪 Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Modal proceso de adopción ── */}
      {modalProceso && (
        <div className="adopt-modal-overlay" onClick={() => setModalProceso(false)}>
          <div className="adopt-proceso-modal" onClick={e => e.stopPropagation()}>
            <button className="adopt-modal-close" onClick={() => setModalProceso(false)}>✕</button>
            <div className="adopt-proceso-header">
              <span className="adopt-proceso-eyebrow">¿Cómo funciona?</span>
              <h2>Proceso de Adopción</h2>
              <p>Adoptar es fácil y seguro. Sigue estos pasos para darle un hogar a un animalito.</p>
            </div>
            <div className="adopt-proceso-pasos">
              {PASOS_ADOPCION.map((paso, i) => (
                <div className="adopt-proceso-paso" key={i}>
                  <div className="adopt-proceso-num">{paso.num}</div>
                  <div className="adopt-proceso-icon">{paso.icon}</div>
                  <div className="adopt-proceso-info">
                    <h3>{paso.titulo}</h3>
                    <p>{paso.desc}</p>
                  </div>
                  {i < PASOS_ADOPCION.length - 1 && <div className="adopt-proceso-linea" />}
                </div>
              ))}
            </div>
            <button className="adopt-proceso-cta" onClick={() => setModalProceso(false)}>
              ¡Entendido, quiero adoptar! 🐾
            </button>
          </div>
        </div>
      )}

      {/* ── Banner + Tabs admin ── */}
      {esAdmin && (
        <>
          <section className="adopt-top-cta">
            <div className="adopt-top-cta-inner">
              <span className="adopt-top-cta-eyebrow">Panel de administración</span>
              <h2>Gestiona las mascotas y sus solicitudes</h2>
              <p>Agrega, edita y administra los animales en adopción, y revisa las solicitudes de la comunidad.</p>
            </div>
          </section>
          <div className="admin-tabs">
            <button className={`admin-tab ${tabAdmin === "mascotas" ? "admin-tab--active" : ""}`} onClick={() => setTabAdmin("mascotas")}>🐾 Mascotas</button>
            <button className={`admin-tab ${tabAdmin === "solicitudes" ? "admin-tab--active" : ""}`} onClick={() => setTabAdmin("solicitudes")}>📋 Solicitudes</button>
          </div>
        </>
      )}

      {/* ── Modal detalle mascota ── */}
      {mascotaSeleccionada && (
        <div className="adopt-modal-overlay" onClick={() => setMascotaSeleccionada(null)}>
          <div className="adopt-modal-detail" onClick={e => e.stopPropagation()}>
            <button className="adopt-modal-close" onClick={() => setMascotaSeleccionada(null)}>✕</button>
            <div className="adopt-modal-img-wrap">
              {mascotaSeleccionada.fotos?.[0]?.url_foto
                ? <img src={mascotaSeleccionada.fotos[0].url_foto} alt={mascotaSeleccionada.nombre} />
                : <div className="adopt-modal-img-placeholder">🐾</div>}
              <span className={`adopt-badge-modal ${getBadge(mascotaSeleccionada.estado_adopcion).cls}`}>
                {getBadge(mascotaSeleccionada.estado_adopcion).label}
              </span>
            </div>
            <div className="adopt-modal-info">
              <h2>{mascotaSeleccionada.nombre}</h2>
              <p className="adopt-modal-sub">{getEdadTexto(mascotaSeleccionada.edad)} · {mascotaSeleccionada.raza}</p>
              <div className="adopt-modal-tags">
                <span>🐾 {mascotaSeleccionada.especie}</span>
                <span>⚕️ {mascotaSeleccionada.estado_salud}</span>
                {mascotaSeleccionada.sexo && <span>{mascotaSeleccionada.sexo === "Macho" ? "♂️" : "♀️"} {mascotaSeleccionada.sexo}</span>}
              </div>
              {mascotaSeleccionada.estado_adopcion?.toLowerCase() === "disponible" && (
                <button className="btn-adoptar-modal" onClick={() => { setMascotaSeleccionada(null); setModalSolicitud(mascotaSeleccionada); }}>
                  ¡Adoptame! 🐾
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal solicitud ── */}
      {modalSolicitud && (
        <ModalSolicitudAdopcion mascota={modalSolicitud} token={token} onClose={() => setModalSolicitud(null)} getEdadTexto={getEdadTexto} />
      )}

      {esAdmin && tabAdmin === "mascotas" && <Mascotas onSwitch={onSwitch} user={user} embebido={true} />}
      {esAdmin && tabAdmin === "solicitudes" && (
        <div className="admin-solicitudes">
          <h2>Solicitudes de Adopción</h2>
          <SolicitudesAdopcion token={token} />
        </div>
      )}

      {/* ════ VISTA USUARIO NORMAL ════ */}
      {!esAdmin && (
        <>
          <section className="adopt-top-cta">
            <div className="adopt-top-cta-inner">
              <span className="adopt-top-cta-eyebrow">Adopta, no compres</span>
              <h2>Encuentra a tu alma gemela peluda</h2>
              <p>Cada animal merece una segunda oportunidad. Dale un hogar definitivo a una mascota de la calle hoy y siente el amor incondicional.</p>
              <div className="adopt-search-bar">
                <span className="adopt-search-icon">🔍</span>
                <input type="text" placeholder="Buscar por nombre, raza o especie…" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                {busqueda && <button className="adopt-search-clear" onClick={() => setBusqueda("")} title="Limpiar">✕</button>}
              </div>
            </div>
          </section>

          <div className="adopt-page">
            <div className="adopt-filters-wrap">
              <div className="adopt-filters-top">
                <h2 className="adopt-filters-title">
                  Mascotas en adopción
                  {mascotasOrdenadas.length > 0 && <span className="adopt-count-badge">{mascotasOrdenadas.length}</span>}
                </h2>
                {hayFiltros && <button className="adopt-clear-btn" onClick={limpiarFiltros}>✕ Limpiar filtros</button>}
              </div>
              <div className="adopt-filters-group">
                <FilterDropdown label="Especie" options={ESPECIES} value={filtroEspecie} onChange={setFiltroEspecie} />
                <FilterDropdown label="Edad"    options={EDADES}   value={filtroEdad}    onChange={setFiltroEdad} />
                <FilterDropdown label="Género"  options={GENEROS}  value={filtroGenero}  onChange={setFiltroGenero} />
              </div>
            </div>

            {hayFiltros && (
              <div className="adopt-active-filters">
                {filtroEspecie !== "Todos" && <span className="adopt-filter-chip">{filtroEspecie}<button onClick={() => setFiltroEspecie("Todos")}>✕</button></span>}
                {filtroEdad   !== "Todos" && <span className="adopt-filter-chip">{filtroEdad}<button onClick={() => setFiltroEdad("Todos")}>✕</button></span>}
                {filtroGenero !== "Todos" && <span className="adopt-filter-chip">{filtroGenero}<button onClick={() => setFiltroGenero("Todos")}>✕</button></span>}
                {busqueda && <span className="adopt-filter-chip">"{busqueda}"<button onClick={() => setBusqueda("")}>✕</button></span>}
              </div>
            )}

            {loading ? (
              <div className="adopt-loading"><div className="adopt-spinner" /><p>Buscando amigos en espera…</p></div>
            ) : mascotasOrdenadas.length === 0 ? (
              <div className="adopt-empty"><span>🐾</span><p>No encontramos mascotas con esos filtros</p><button onClick={limpiarFiltros}>Limpiar filtros</button></div>
            ) : (
              <div className="adopt-grid">
                {mascotasOrdenadas.map(mascota => {
                  const disponible = mascota.estado_adopcion?.toLowerCase() === "disponible";
                  const badge = getBadge(mascota.estado_adopcion);
                  return (
                    <div className={`adopt-card ${!disponible ? "adopt-card--nodisponible" : ""}`} key={mascota.id_mascota}>
                      <div className="adopt-card-img-wrap">
                        {mascota.fotos?.[0]?.url_foto
                          ? <img src={mascota.fotos[0].url_foto} alt={mascota.nombre} className="adopt-card-img" />
                          : <div className="adopt-card-img-placeholder">🐾</div>}
                        <span className={`adopt-card-status-badge ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="adopt-card-body">
                        <div className="adopt-card-header-row">
                          <h3>{mascota.nombre}</h3>
                          {mascota.sexo && <span className="adopt-card-sex">{mascota.sexo === "Macho" ? "♂" : "♀"}</span>}
                        </div>
                        <p className="adopt-card-meta">{getEdadTexto(mascota.edad)} · {mascota.raza}</p>
                        {mascota.especie && <span className="adopt-card-especie-pill">{mascota.especie}</span>}
                        <div className="adopt-card-actions">
                          <button className="btn-adoptar" disabled={!disponible} onClick={() => disponible && setModalSolicitud(mascota)}>
                            {getBtnTexto(disponible, mascota.estado_adopcion)}
                          </button>
                          <button className="btn-info" onClick={() => setMascotaSeleccionada(mascota)} title="Ver más info">ℹ</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="adopt-footer">
            <div className="adopt-footer-inner">
              <div className="adopt-footer-brand">
                <span className="footer-brand-icon">🐾</span>
                <strong>Street Paws</strong>
                <p>Ayudando a los animales de la calle a encontrar hogares amorosos. Tu adopción puede salvar una vida y traerte alegría.</p>
                <div className="footer-social">
                  <a
                    href="https://www.instagram.com/streetpawscorp?igsh=MW41NTk3NnVxNmFqdA=="
                    target="_blank"
                    rel="noreferrer"
                    className="footer-social-btn"
                    title="Instagram"
                  >
                    📷
                  </a>
                </div>
              </div>
              <div className="adopt-footer-col">
                <h4>Compañía</h4>
                <a
                  href="https://www.instagram.com/streetpawscorp?igsh=MW41NTk3NnVxNmFqdA=="
                  target="_blank"
                  rel="noreferrer"
                  className="adopt-footer-link"
                >
                  Contacto
                </a>
              </div>
              <div className="adopt-footer-col">
                <h4>Ayuda</h4>
                <span className="adopt-footer-link" onClick={() => setModalProceso(true)}>
                  Proceso de Adopción
                </span>
              </div>
            </div>
            <div className="adopt-footer-bottom">
              © {new Date().getFullYear()} Street Paws · Hecho con 🐾 para los animales
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
    <div className={`filter-dropdown ${isActive ? "filter-dropdown--active" : ""}`}>
      <button className="filter-dropdown-btn" onClick={e => { e.stopPropagation(); setOpen(v => !v); }}>
        {isActive ? value : label}
        <span className="filter-dropdown-arrow">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="filter-dropdown-menu" onClick={e => e.stopPropagation()}>
          {options.map(opt => (
            <div key={opt} className={`filter-dropdown-item ${value === opt ? "selected" : ""}`} onClick={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Adopciones;