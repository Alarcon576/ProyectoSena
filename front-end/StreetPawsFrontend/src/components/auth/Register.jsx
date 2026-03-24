import { useState } from "react";
import "./Register.css";

function Register({ onSwitch }) {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
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
  
  if (!form.nombre || !form.email || !form.password) {
    setErrors({ general: "Completa los campos obligatorios" });
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        email: form.email,
        contrasena: form.password,
        direccion: form.direccion || "", // Campos de tu controlador
        telefono: form.telefono || ""
      })
    });

    const data = await res.json();

    if (res.ok) {
      setSuccessMsg("¡Cuenta creada con éxito!");
      setForm({ nombre: "", email: "", password: "", direccion: "", telefono: "" }); // Limpia todo
      setErrors({});
    } else {
      setErrors({ general: data.msg });
    }
  } catch (error) {
    setErrors({ general: "Error al conectar con el servidor" });
  }
};

  return (
    <div className="reg-page">
      <div className="reg-left-side">
        <div className="reg-brand" onClick={() => onSwitch("login")}>🐾 Street Paws</div>
        <div className="reg-hero-content">
          <h1>Únete a nuestra <span>comunidad.</span></h1>
          <p>Cada registro es una oportunidad más para darles el hogar que merecen.</p>
        </div>
      </div>

      <div className="reg-right-side">
        <div className="reg-form-container">
          <h2>Crear cuenta</h2>
          <p className="reg-subtitle">Regístrate para empezar a ayudar.</p>

          {successMsg && <p className="success-text">{successMsg}</p>}

          <form onSubmit={handleSubmit}>
            <div className="reg-field">
              <label>Nombre completo</label>
              <div className="reg-input-box">
                <span className="reg-icon">👤</span>
                <input name="nombre" type="text" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} />
              </div>
              {errors.nombre && <p className="error-text">{errors.nombre}</p>}
            </div>

            <div className="reg-field">
              <label>Correo electrónico</label>
              <div className="reg-input-box">
                <span className="reg-icon">✉️</span>
                <input name="email" type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="reg-field">
              <label>Contraseña</label>
              <div className="reg-input-box">
                <span className="reg-icon">🔒</span>
                <input name="password" type={showPassword ? "text" : "password"} placeholder="********" value={form.password} onChange={handleChange} />
                <button type="button" className="reg-eye" onClick={() => setShowPassword(!showPassword)}>👁️</button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
              {errors.general && <p className="error-text">{errors.general}</p>}
            </div>

            <button type="submit" className="reg-btn">Crear cuenta</button>
          </form>
          
          <p className="reg-footer">
            ¿Ya tienes cuenta? <span onClick={() => onSwitch("login")}>Inicia sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;