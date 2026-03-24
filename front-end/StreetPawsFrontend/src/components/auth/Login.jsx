import { useState } from "react";
import "./Login.css";


function Login({ onSwitch, onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const decodeToken = (token) => {
    return JSON.parse(atob(token.split(".")[1]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          contrasena: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.msg });
        return;
      }

     
      localStorage.setItem("token", data.token);

   
      const user = decodeToken(data.token);

    
      onLogin(user);

    } catch {
      setErrors({ general: "Error servidor" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Ayudando a encontrar hogares felices</h1>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
            />

            <span onClick={() => setShowPassword(!showPassword)}>
              mostrar
            </span>
          </div>

          {errors.general && <p className="error">{errors.general}</p>}

          <button>Ingresar</button>

          <p onClick={() => onSwitch("register")} style={{ cursor: "pointer" }}>
            ¿No tienes cuenta? Regístrate
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;