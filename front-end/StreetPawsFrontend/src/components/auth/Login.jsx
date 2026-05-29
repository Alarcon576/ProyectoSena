import { useState } from "react";
import "./Login.css";

function Login({ onSwitch, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ¿Viene de crear cuenta? (bandera dejada por Register)
  const [esCuentaNueva] = useState(
    () => localStorage.getItem("cuentaRecienCreada") === "1"
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const decodeToken = (token) => JSON.parse(atob(token.split(".")[1]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.email) newErrors.email = "El correo es obligatorio";
    else if (!form.email.includes("@")) newErrors.email = "Correo inválido";

    if (!form.password) newErrors.password = "La contraseña es obligatoria";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://proyectosena-production-4ad5.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, contrasena: form.password }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.msg || "Credenciales incorrectas" });
        return;
      }

      localStorage.setItem("token", data.token);
      // Ya entró: la bandera de cuenta nueva deja de ser relevante
      localStorage.removeItem("cuentaRecienCreada");
      const user = decodeToken(data.token);
      setLoggedUser(user);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        onLogin(user);
      }, 1800);
    } catch {
      setErrors({ general: "Error de servidor" });
    } finally {
      setLoading(false);
    }
  };

  const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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

  return (
    <div className="login-container">
      {showSuccessModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-icon">✓</div>
            {/* Mensaje según sea cuenta nueva o login recurrente */}
            <h3>{esCuentaNueva ? "¡Bienvenido a Street Paws!" : "¡Bienvenido de vuelta!"}</h3>
            <p>
              {esCuentaNueva
                ? "Tu cuenta está lista. Preparando tu experiencia…"
                : "Iniciaste sesión correctamente. Preparando tu experiencia…"}
            </p>
            <button
              className="login-modal-btn"
              onClick={() => { setShowSuccessModal(false); onLogin(loggedUser); }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <div className="login-left">
        <h2 className="logo">Street Paws</h2>
        <div className="login-text">
          <h1>Únete a nuestra <span>comunidad.</span></h1>
          <p>Cada registro es una oportunidad más para darles el hogar que merecen.</p>
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <p className="login-subtitle">
            {esCuentaNueva
              ? "¡Tu cuenta fue creada! Inicia sesión para continuar."
              : "¡Inicia sesión para ver lo que tenemos para ti!"}
          </p>

          {errors.general && <p className="error">{errors.general}</p>}

          <label>Correo electrónico</label>
          <div className="input-box">
            <input
              type="email" name="email" placeholder="ejemplo@correo.com"
              value={form.email} onChange={handleChange}
            />
          </div>
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Contraseña</label>
          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"} name="password" placeholder="********"
              value={form.password} onChange={handleChange}
            />
            <button
              type="button" className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <span className={`eye-icon ${showPassword ? "eye-open" : "eye-closed"}`}>
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </span>
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>

          <p className="switch-text">
            ¿No tienes cuenta?{" "}
            <span onClick={() => onSwitch("register")}>Regístrate</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;