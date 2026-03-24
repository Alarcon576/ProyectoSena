import { useState } from "react";
import "./Login.css";

function Login({ onSwitch, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, contrasena: form.password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setSuccessMsg("¡Iniciaste sesión correctamente!");
        setForm({ email: "", password: "" }); // Limpieza de campos
        
        // Espera un segundo para que vean el mensaje y redirige vía App.jsx
        setTimeout(() => {
          const userBase = JSON.parse(atob(data.token.split(".")[1]));
          onLogin(userBase);
        }, 1000);
      } else {
        setErrors({ general: data.msg || "Error de credenciales" });
      }
    } catch {
      setErrors({ general: "No hay conexión con el servidor (Puerto 3000)" });
    }
  };

  return (
    <div className="log-page">
      <header className="log-header">
        <div className="log-brand">🐾 Street Paws</div>
      </header>
      <div className="log-card-area">
        <div className="log-card">
          <div className="log-card-left">
            <h1>Ayudando a encontrar <span>hogares felices.</span></h1>
          </div>
          <div className="log-card-right">
            <form onSubmit={handleSubmit}>
              <h2>¡Bienvenido!</h2>
              {successMsg && <p className="success-text">{successMsg}</p>}
              {errors.general && <p className="error-text">{errors.general}</p>}
              
              <div className="log-field">
                <label className="log-label">Correo</label>
                <div className="log-input-box">
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="log-field">
                <label className="log-label">Contraseña</label>
                <div className="log-input-box">
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" />
                  <button type="button" className="log-eye" onClick={() => setShowPassword(!showPassword)}>👁️</button>
                </div>
              </div>
              <button type="submit" className="log-btn">Ingresar</button>
            </form>
            <p className="log-footer-text">¿No tienes cuenta? <span onClick={() => onSwitch("register")}>Regístrate</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;