import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./Navbar.css";

const URL_PROFILE =
  "https://proyectosena-production-4ad5.up.railway.app/api/profile";
const URL_NOTIFICACIONES =
  "https://proyectosena-production-4ad5.up.railway.app/api/notificaciones";

function Navbar({
  onSwitch,
  activeView = "",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  showNotifications = false,
  showSidebarToggle = false,
  onSidebarToggle,
}) {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarConfirmLogout, setMostrarConfirmLogout] = useState(false);

  const token = localStorage.getItem("token");
  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    if (!token) return;
    fetch(`${URL_PROFILE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUsuarioActual(d))
      .catch(() => {});
  }, [token]);

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

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setMenuAvatarAbierto(false);
    setMostrarConfirmLogout(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    setMostrarConfirmLogout(false);
    onSwitch("login");
  };

  return (
    <>
      <nav className="nb-navbar">
        {/* Brand */}
        <div className="nb-brand" onClick={() => onSwitch("feed")}>
          Street Paws
        </div>

        {/* Links */}
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

        {/* Derecha */}
        <div className="nb-right">
          {showSearch && (
            <input
              className="nb-search"
              type="text"
              placeholder="Buscar usuarios..."
              value={searchValue}
              onChange={onSearchChange}
            />
          )}

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
                  <span className="nb-notif-badge">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>
              {mostrarNotificaciones && (
                <div className="nb-notif-dropdown">
                  {notificaciones.length === 0 ? (
                    <div className="nb-notif-item">
                      No tienes notificaciones
                    </div>
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
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  usuarioActual?.nombre?.charAt(0) || "U"
                )}
              </div>
              {menuAvatarAbierto && (
                <div
                  className="nb-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
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
                  <button
                    className="nb-dropdown-logout"
                    onClick={handleLogoutClick}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modal logout — montado en body, fuera del nav */}
      {mostrarConfirmLogout &&
        ReactDOM.createPortal(
          <div
            className="nb-logout-overlay"
            onClick={() => setMostrarConfirmLogout(false)}
          >
            <div
              className="nb-logout-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nb-logout-icon">🚪</div>
              <h3>¿Cerrar sesión?</h3>
              <p>
                Tu sesión se cerrará y tendrás que iniciar sesión nuevamente
                para acceder.
              </p>
              <div className="nb-logout-actions">
                <button
                  className="nb-logout-cancel"
                  onClick={() => setMostrarConfirmLogout(false)}
                >
                  Cancelar
                </button>
                <button
                  className="nb-logout-confirm"
                  onClick={handleLogoutConfirm}
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Navbar;
