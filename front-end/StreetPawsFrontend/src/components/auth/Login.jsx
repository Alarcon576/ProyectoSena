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
    <div className="login-container">

      {/* IZQUIERDA */}
      <div className="login-left">
        <h2 className="logo">🐾 Street Paws</h2>

        <div className="login-text">
          <h1>
            Únete a nuestra <span>comunidad.</span>
          </h1>
          <p>
            Cada registro es una oportunidad más para darles el hogar que merecen.
          </p>
        </div>
      </div>

      {/* DERECHA */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          {errors.general && <p className="error">{errors.general}</p>}

          <label>Correo electrónico</label>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <label>Contraseña</label>
          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
            <span onClick={() => setShowPassword(!showPassword)}>👁️</span>
          </div>

          <button type="submit">Ingresar</button>

          <p className="switch-text">
            ¿No tienes cuenta?{" "}
            <span onClick={() => onSwitch("register")}>
              Regístrate
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;