import { useState } from "react";
import "./Register.css";

function Register({ onSwitch }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    direccion: "",
    telefono: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return Math.min(score, 4);
  };

  const strengthInfo = (score) => {
    if (score === 0) return { label: "",          color: "#e0e0e0" };
    if (score === 1) return { label: "Muy débil",  color: "#e53935" };
    if (score === 2) return { label: "Débil",      color: "#fb8c00" };
    if (score === 3) return { label: "Media",      color: "#fdd835" };
    return               { label: "Fuerte",    color: "#43a047" };
  };

  const getChecks = (pwd) => [
    { key: "len",     label: "8+ caracteres",      ok: pwd.length >= 8 },
    { key: "upper",   label: "Mayúscula",            ok: /[A-Z]/.test(pwd) },
    { key: "lower",   label: "Minúscula",            ok: /[a-z]/.test(pwd) },
    { key: "number",  label: "Número",               ok: /[0-9]/.test(pwd) },
    { key: "special", label: "Carácter especial",    ok: /[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd) },
    { key: "nospace", label: "Sin espacios",         ok: !/\s/.test(pwd) && pwd.length > 0 },
  ];

  const strengthScore = getStrength(form.password);
  const strength      = strengthInfo(strengthScore);
  const checks        = getChecks(form.password);

  const validatePassword = (pwd) => {
    const errs = [];
    if (pwd.length < 8)                              errs.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(pwd))                          errs.push("al menos una mayúscula");
    if (!/[a-z]/.test(pwd))                          errs.push("al menos una minúscula");
    if (!/[0-9]/.test(pwd))                          errs.push("al menos un número");
    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(pwd))     errs.push("al menos un carácter especial");
    if (/\s/.test(pwd))                              errs.push("no puede contener espacios");
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.nombre || !form.email || !form.password) {
      setErrors({ general: "Completa los campos obligatorios" });
      return;
    }

    // Teléfono obligatorio
    if (!form.telefono || !form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{9,12}$/.test(form.telefono.trim())) {
      newErrors.telefono = "Ingresa un número válido (9 a 12 dígitos)";
    }

    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length > 0) newErrors.password = pwdErrors.join(" · ");
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch(
        "https://proyectosena-production-4ad5.up.railway.app/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre:    form.nombre,
            email:     form.email,
            contrasena: form.password,
            direccion: form.direccion || "",
            telefono:  form.telefono,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        // Bandera para que Login muestre el mensaje de cuenta nueva
        localStorage.setItem("cuentaRecienCreada", "1");
        setShowSuccessModal(true);
        setForm({
          nombre: "",
          email: "",
          password: "",
          confirmPassword: "",
          direccion: "",
          telefono: "",
        });
        setErrors({});
      } else {
        setErrors({ general: data.msg || "Error al registrar usuario" });
      }
    } catch {
      setErrors({ general: "Error al conectar con el servidor" });
    }
  };

  /* ── SVG icons ── */
  const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const IconMail = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const IconHome = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  const IconPhone = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.68 5.68l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <div className="reg-page">
      {/* ── Modal éxito ── */}
      {showSuccessModal && (
        <div className="reg-modal-overlay">
          <div className="reg-modal">
            <div className="reg-modal-icon">✓</div>
            <h3>¡Registro exitoso!</h3>
            <p>Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.</p>
            <button
              className="reg-modal-btn"
              onClick={() => {
                setShowSuccessModal(false);
                onSwitch("login");
              }}
            >
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      )}

      {/* ── Lado izquierdo ── */}
      <div className="reg-left-side">
        <div className="reg-brand" onClick={() => onSwitch("login")}>Street Paws</div>
        <div className="reg-hero-content">
          <h1>Únete a nuestra <span>comunidad.</span></h1>
          <p>Cada registro es una oportunidad más para darles el hogar que merecen.</p>
        </div>
      </div>

      {/* ── Lado derecho ── */}
      <div className="reg-right-side">
        <div className="reg-form-container">
          <h2>Crear cuenta</h2>
          <p className="reg-subtitle">Regístrate para empezar a ayudar.</p>

          <form onSubmit={handleSubmit}>

            {/* Fila 1: Nombre + Email */}
            <div className="reg-row">
              <div className="reg-field">
                <label>Nombre completo</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconUser /></span>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </div>
                {errors.nombre && <p className="error-text">{errors.nombre}</p>}
              </div>

              <div className="reg-field">
                <label>Correo electrónico</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconMail /></span>
                  <input
                    name="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
            </div>

            {/* Fila 2: Dirección + Teléfono */}
            <div className="reg-row">
              <div className="reg-field">
                <label>Dirección</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconHome /></span>
                  <input
                    name="direccion"
                    type="text"
                    placeholder="Dirección"
                    value={form.direccion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="reg-field">
                <label>Teléfono *</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconPhone /></span>
                  <input
                    name="telefono"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Número de teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>
                {errors.telefono && <p className="error-text">{errors.telefono}</p>}
              </div>
            </div>

            {/* Fila 3: Contraseña + Confirmar */}
            <div className="reg-row">
              <div className="reg-field">
                <label>Contraseña</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconLock /></span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Escribe una contraseña"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="reg-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className={`eye-icon ${showPassword ? "eye-open" : "eye-closed"}`}>
                      {showPassword ? <EyeClosed /> : <EyeOpen />}
                    </span>
                  </button>
                </div>

                {/* ── Indicador de fortaleza ── */}
                {form.password.length > 0 && (
                  <div className="strength-wrapper">
                    {/* Barra segmentada */}
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`strength-bar-segment ${
                            strengthScore >= seg ? `filled-${strengthScore}` : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    {/* Checklist */}
                    <div className="strength-checklist">
                      {checks.map((c) => (
                        <span
                          key={c.key}
                          className={`strength-check-item ${c.ok ? "valid" : "invalid"}`}
                        >
                          <span className="strength-check-icon">{c.ok ? "✓" : "·"}</span>
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              <div className="reg-field">
                <label>Confirmar contraseña</label>
                <div className="reg-input-box">
                  <span className="reg-icon"><IconLock /></span>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="reg-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className={`eye-icon ${showConfirmPassword ? "eye-open" : "eye-closed"}`}>
                      {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                {errors.general && <p className="error-text">{errors.general}</p>}
              </div>
            </div>

            <button type="submit" className="reg-btn">Crear cuenta</button>
          </form>

          <p className="reg-footer">
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => onSwitch("login")}>Inicia sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;