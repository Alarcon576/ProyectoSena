import { useState } from "react";
import "./Login.css";

function Login({ onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setSuccessMsg(""); 
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Validación de campos vacíos (Frontend)
  if (!form.email || !form.password) {
    setErrors({ general: "Todos los campos son obligatorios" });
    return;
  }

  try {
    // 2. Tu lógica original de conexión
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: form.email, 
        contrasena: form.password // Uso 'contrasena' para tu controlador
      })
    });

    const data = await res.json();

    if (res.ok) {
      // 3. ÉXITO: Mensaje, Limpieza y NO redirige
      setSuccessMsg("¡Iniciaste sesión correctamente!");
      setForm({ email: "", password: "" }); 
      setErrors({});
    } else {
      // 4. ERROR: Muestra el msg que viene de tu controlador (401, 404, etc.)
      setErrors({ general: data.msg });
    }
  } catch (error) {
    setErrors({ general: "Error de conexión con el servidor" });
  }
};

  return (
    <div className="log-page">
      <header className="log-header">
        <div className="log-brand">🐾 Street Paws</div>
        <div className="log-header-right">
          <button className="log-nav-btn" onClick={() => onSwitch("mascotas")}>Ir a Mascotas </button>
    
        </div>
      </header>

      <div className="log-card-area">
        <div className="log-card">
          <div className="log-card-left">
            <div className="log-left-content">
              <h1>Ayudando a encontrar <span>hogares felices.</span></h1>
              <p>Inicia sesión para gestionar adopciones y conectar con otros amantes de los animales.</p>
             
            </div>
          </div>

          <div className="log-card-right">
            <form onSubmit={handleSubmit}>
              <h2>¡Bienvenido de nuevo!</h2>
              <p className="log-subtitle">Es un gusto verte otra vez por aquí.</p>

              {successMsg && <p className="success-text">{successMsg}</p>}

              <div className="log-field">
                <label className="log-label">Correo electrónico</label>
                <div className="log-input-box">
                  <span className="log-icon">✉️</span>
                  <input name="email" type="email" placeholder="tu@ejemplo.com" value={form.email} onChange={handleChange} />
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              <div className="log-field">
                <div className="log-label-container">
                  <label className="log-label">Contraseña</label>
                  <span className="log-forgot">¿Olvidaste tu contraseña?</span>
                </div>
                <div className="log-input-box">
                  <span className="log-icon">🔒</span>
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={handleChange} />
                  <button type="button" className="log-eye" onClick={() => setShowPassword(!showPassword)}>👁️</button>
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}
                {errors.general && <p className="error-text" style={{textAlign: 'center'}}>{errors.general}</p>}
              </div>

              <button type="submit" className="log-btn">Iniciar Sesión</button>
            </form>
            <p className="log-footer-text">
              ¿Nuevo en Street Paws? <span onClick={() => onSwitch("register")}>Crea una cuenta ahora</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;