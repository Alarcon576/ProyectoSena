import { useState, useEffect } from "react";
import "./Navbar.css";

const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";
const URL_NOTIFICACIONES =
  "https://proyectosena-production-4ad5.up.railway.app/api/notificaciones";

/**
 * Navbar unificada de Street Paws
 *
 * Props:
 *  - onSwitch(view, payload?)  → navegación entre vistas
 *  - activeView                → string con la vista activa ("feed"|"explorar"|"adopciones"|...)
 *  - showSearch                → muestra input de búsqueda (solo Feed)
 *  - searchValue               → valor del input de búsqueda
 *  - onSearchChange            → handler onChange del buscador
 *  - showNotifications         → muestra el botón de notificaciones (solo Feed)
 *  - showSidebarToggle         → muestra el botón ✦ del drawer móvil (solo Feed)
 *  - onSidebarToggle           → handler del botón ✦
 *  - showNavActions            → muestra botones de acción tipo Perfil ("Feed", "Salir")
 *  - extraActions              → array de { label, onClick, className? } para botones extra
 */
function Navbar({
  onSwitch,
  activeView = "",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  showNotifications = false,
  showSidebarToggle = false,
  onSidebarToggle,
  showNavActions = false,
  extraActions = [],
}) {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  const token = localStorage.getItem("token");
  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  /* ── Cargar usuario ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${URL_PROFILE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsuarioActual(d))
      .catch(() => {});
  }, [token]);

  /* ── Cargar notificaciones (solo si se muestran) ── */
  useEffect(() => {
    if (!showNotifications || !token) return;

    const cargar = () =>
      fetch(URL_NOTIFICACIONES, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setNotificaciones(Array.isArray(d) ? d : []))
        .catch(() => {});

    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => clearInterval(intervalo);
  }, [showNotifications, token]);

  /* ── Cerrar menús al click fuera ── */
  useEffect(() => {
    const cerrar = (e) => {
      if (!e.target.closest(".nb-avatar-wrapper")) setMenuAvatarAbierto(false);
      if (!e.target.closest(".nb-notif-wrapper"))
        setMostrarNotificaciones(false);
    };
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const marcarLeida = async (id) => {
    try {
      await fetch(
        `https://proyectosena-production-4ad5.up.railway.app/api/notificaciones/${id}/leida`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
      );
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n)),
      );
    } catch {}
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("token");
    onSwitch("login");
  };

  return (
    <nav className="nb-navbar">
      {/* ── Brand ── */}
      <div className="nb-brand" onClick={() => onSwitch("feed")}>
        Street Paws
      </div>

      {/* ── Links centrales ── */}
      <div className="nb-links">
        <span
          className={activeView === "feed" ? "active" : ""}
          onClick={() => onSwitch("feed")}
        >
          Inicio
        </span>
        <span
          className={activeView === "explorar" ? "active" : ""}
          onClick={() => onSwitch("explorar")}
        >
          Explorar
        </span>
        <span
          className={activeView === "adopciones" ? "active" : ""}
          onClick={() => onSwitch("adopciones")}
        >
          Adopciones
        </span>
      </div>

      {/* ── Lado derecho ── */}
      <div className="nb-right">
        {/* Buscador — solo Feed */}
        {showSearch && (
          <input
            className="nb-search"
            type="text"
            placeholder="Buscar usuarios..."
            value={searchValue}
            onChange={onSearchChange}
          />
        )}

        {/* Botón drawer móvil — solo Feed */}
        {showSidebarToggle && (
          <button
            className="nb-sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onSidebarToggle?.();
            }}
            aria-label="Abrir panel lateral"
            title="IA, Tendencias y más"
          >
            ✦
          </button>
        )}

        {/* Notificaciones — solo Feed */}
        {showNotifications && (
          <div
            className="nb-notif-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarNotificaciones((v) => !v);
            }}
          >
            <button className="nb-notif-btn">
              🔔
              {notificacionesNoLeidas > 0 && (
                <span className="nb-notif-badge">{notificacionesNoLeidas}</span>
              )}
            </button>

            {mostrarNotificaciones && (
              <div className="nb-notif-dropdown">
                {notificaciones.length === 0 ? (
                  <div className="nb-notif-item">No tienes notificaciones</div>
                ) : (
                  notificaciones.map((n) => (
                    <div
                      key={n.id_notificacion}
                      className={`nb-notif-item ${!n.leida ? "no-leida" : ""}`}
                      onClick={async () => {
                        await marcarLeida(n.id_notificacion);
                        if (n.referencia_id) {
                          const el = document.getElementById(
                            `post-${n.referencia_id}`,
                          );
                          if (el)
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }
                        setMostrarNotificaciones(false);
                      }}
                    >
                      <strong>{n.titulo}</strong>
                      <p>{n.mensaje}</p>
                      <small>{new Date(n.fecha).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones extra (ej: "Feed", "Salir" en Perfil) */}
        {showNavActions &&
          extraActions.map((accion, i) => (
            <button
              key={i}
              className={`nb-action-btn ${accion.className || ""}`}
              onClick={accion.onClick}
            >
              {accion.label}
            </button>
          ))}

        {/* Avatar + dropdown — siempre visible si hay token */}
        {token && (
          <div
            className="nb-avatar-wrapper"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAvatarAbierto((v) => !v);
            }}
          >
            <div className="nb-avatar">
              {usuarioActual?.foto_perfil ? (
                <img
                  src={usuarioActual.foto_perfil}
                  alt={usuarioActual.nombre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                usuarioActual?.nombre?.charAt(0) || "U"
              )}
            </div>

            {menuAvatarAbierto && (
              <div className="nb-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="nb-dropdown-header">
                  <span className="nb-dropdown-nombre">
                    {usuarioActual?.nombre || "Usuario"}
                  </span>
                  <span className="nb-dropdown-email">
                    {usuarioActual?.email || ""}
                  </span>
                </div>
                <div className="nb-dropdown-divider" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAvatarAbierto(false);
                    onSwitch("perfil");
                  }}
                >
                  👤 Mi perfil
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAvatarAbierto(false);
                    onSwitch("configuracion");
                  }}
                >
                  ⚙️ Configuración
                </button>
                <div className="nb-dropdown-divider" />
                <button className="nb-dropdown-logout" onClick={handleLogout}>
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
