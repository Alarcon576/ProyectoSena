import { useState, useEffect } from "react";
import "./Configuracion.css";

const URL_PROFILE = "https://proyectosena-production-4ad5.up.railway.app/api/profile";

function Configuracion({ onSwitch }) {
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("perfil");
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // ── Datos de perfil ──
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", direccion: "", descripcion: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [okPerfil, setOkPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState("");

  // ── Cambio de contraseña ──
  const [pwd, setPwd] = useState({ actual: "", nueva: "", confirmar: "" });
  const [verPwd, setVerPwd] = useState(false);
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [okPwd, setOkPwd] = useState(false);
  const [errorPwd, setErrorPwd] = useState("");

  /* ── Cargar datos actuales ── */
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${URL_PROFILE}/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setForm({
          nombre:      data.nombre      || "",
          email:       data.email       || "",
          telefono:    data.telefono    || "",
          direccion:   data.direccion   || "",
          descripcion: data.descripcion || "",
        });
      } catch (err) { console.error("Error cargando perfil:", err); }
      finally { setCargandoPerfil(false); }
    };
    cargar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setOkPerfil(false); setErrorPerfil("");
  };
  const handlePwd = (e) => {
    setPwd({ ...pwd, [e.target.name]: e.target.value });
    setOkPwd(false); setErrorPwd("");
  };

  /* ── Guardar perfil ── */
  const guardarPerfil = async (e) => {
    e.preventDefault();
    setErrorPerfil("");
    if (!form.nombre.trim()) { setErrorPerfil("El nombre es obligatorio"); return; }
    if (!form.telefono.trim() || !/^\d{7,15}$/.test(form.telefono.trim())) {
      setErrorPerfil("Ingresa un teléfono válido (7 a 15 dígitos)"); return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${URL_PROFILE}/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre:      form.nombre.trim(),
          telefono:    form.telefono.trim(),
          direccion:   form.direccion.trim(),
          descripcion: form.descripcion.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrorPerfil(data.msg || data.error || "No se pudo guardar"); return; }
      setOkPerfil(true);
      setTimeout(() => setOkPerfil(false), 3000);
    } catch { setErrorPerfil("Error de conexión con el servidor"); }
    finally { setGuardando(false); }
  };

  /* ── Cambiar contraseña ── */
  const cambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPwd("");
    if (!pwd.actual) { setErrorPwd("Ingresa tu contraseña actual"); return; }
    if (pwd.nueva.length < 8) { setErrorPwd("La nueva contraseña debe tener mínimo 8 caracteres"); return; }
    if (!/[A-Z]/.test(pwd.nueva) || !/[0-9]/.test(pwd.nueva)) {
      setErrorPwd("La nueva contraseña debe incluir una mayúscula y un número"); return;
    }
    if (pwd.nueva !== pwd.confirmar) { setErrorPwd("Las contraseñas no coinciden"); return; }
    if (pwd.nueva === pwd.actual) { setErrorPwd("La nueva contraseña debe ser distinta a la actual"); return; }

    setGuardandoPwd(true);
    try {
      const res = await fetch(`${URL_PROFILE}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contrasena_actual: pwd.actual,
          contrasena_nueva:  pwd.nueva,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrorPwd(data.msg || data.error || "No se pudo cambiar la contraseña"); return; }
      setOkPwd(true);
      setPwd({ actual: "", nueva: "", confirmar: "" });
      setTimeout(() => setOkPwd(false), 3000);
    } catch { setErrorPwd("Error de conexión con el servidor"); }
    finally { setGuardandoPwd(false); }
  };

  return (
    <div className="cfg-root">
      {/* Navbar */}
      <nav className="cfg-navbar">
        <button className="cfg-back-btn" onClick={() => onSwitch("feed")}>← Volver</button>
        <span className="cfg-navbar-brand">Street Paws</span>
        <div className="cfg-navbar-spacer" />
      </nav>

      <div className="cfg-container">
        <div className="cfg-header">
          <h1>⚙️ Configuración</h1>
          <p>Administra tu información y la seguridad de tu cuenta</p>
        </div>

        {/* Tabs */}
        <div className="cfg-tabs">
          <button className={`cfg-tab ${tab === "perfil" ? "cfg-tab--active" : ""}`} onClick={() => setTab("perfil")}>
            👤 Mi información
          </button>
          <button className={`cfg-tab ${tab === "password" ? "cfg-tab--active" : ""}`} onClick={() => setTab("password")}>
            🔒 Contraseña
          </button>
        </div>

        {/* ── TAB PERFIL ── */}
        {tab === "perfil" && (
          <div className="cfg-card">
            {cargandoPerfil ? (
              <div className="cfg-loading"><div className="cfg-spinner" /><p>Cargando tu información…</p></div>
            ) : (
              <form onSubmit={guardarPerfil}>
                <div className="cfg-row">
                  <div className="cfg-field">
                    <label>Nombre completo *</label>
                    <input name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" />
                  </div>
                  <div className="cfg-field">
                    <label>Correo electrónico</label>
                    <input name="email" type="email" value={form.email} disabled title="El correo no se puede cambiar" />
                    <span className="cfg-hint">El correo no se puede modificar</span>
                  </div>
                </div>

                <div className="cfg-row">
                  <div className="cfg-field">
                    <label>Teléfono *</label>
                    <input name="telefono" type="tel" inputMode="numeric" value={form.telefono} onChange={handleChange} placeholder="Número de teléfono" />
                  </div>
                  <div className="cfg-field">
                    <label>Dirección</label>
                    <input name="direccion" type="text" value={form.direccion} onChange={handleChange} placeholder="Tu dirección" />
                  </div>
                </div>

                {/* ── Descripción ── */}
                <div className="cfg-field">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Cuéntanos algo sobre ti…"
                    rows={3}
                    maxLength={300}
                  />
                  <span className="cfg-hint">{form.descripcion.length}/300 caracteres</span>
                </div>

                {errorPerfil && <p className="cfg-error">{errorPerfil}</p>}
                {okPerfil && <p className="cfg-ok">✓ Cambios guardados correctamente</p>}

                <button type="submit" className="cfg-btn-guardar" disabled={guardando}>
                  {guardando ? <span className="cfg-spinner cfg-spinner--btn" /> : "Guardar cambios"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── TAB CONTRASEÑA ── */}
        {tab === "password" && (
          <div className="cfg-card">
            <form onSubmit={cambiarPassword}>
              <div className="cfg-field">
                <label>Contraseña actual *</label>
                <input name="actual" type={verPwd ? "text" : "password"} value={pwd.actual} onChange={handlePwd} placeholder="Tu contraseña actual" />
              </div>
              <div className="cfg-row">
                <div className="cfg-field">
                  <label>Nueva contraseña *</label>
                  <input name="nueva" type={verPwd ? "text" : "password"} value={pwd.nueva} onChange={handlePwd} placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="cfg-field">
                  <label>Confirmar nueva *</label>
                  <input name="confirmar" type={verPwd ? "text" : "password"} value={pwd.confirmar} onChange={handlePwd} placeholder="Repite la nueva contraseña" />
                </div>
              </div>

              <label className="cfg-checkbox">
                <input type="checkbox" checked={verPwd} onChange={() => setVerPwd(!verPwd)} />
                Mostrar contraseñas
              </label>

              <div className="cfg-pwd-reqs">
                <span className={pwd.nueva.length >= 8 ? "ok" : ""}>● 8+ caracteres</span>
                <span className={/[A-Z]/.test(pwd.nueva) ? "ok" : ""}>● Una mayúscula</span>
                <span className={/[0-9]/.test(pwd.nueva) ? "ok" : ""}>● Un número</span>
              </div>

              {errorPwd && <p className="cfg-error">{errorPwd}</p>}
              {okPwd && <p className="cfg-ok">✓ Contraseña actualizada correctamente</p>}

              <button type="submit" className="cfg-btn-guardar" disabled={guardandoPwd}>
                {guardandoPwd ? <span className="cfg-spinner cfg-spinner--btn" /> : "Cambiar contraseña"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Configuracion;