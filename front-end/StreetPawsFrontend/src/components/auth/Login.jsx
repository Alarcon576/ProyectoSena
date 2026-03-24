import { useState } from "react";
import "./Login.css";

function Login({ onSwitch, onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // limpia errores al escribir
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }

    setSuccessMsg("");
  };

  const decodeToken = (token) => {
    return JSON.parse(atob(token.split(".")[1]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!form.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Correo inválido";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 4) {
      newErrors.password = "Mínimo 4 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

      //  mensaje
      setSuccessMsg("¡Inicio de sesión exitoso! ");

      //  redirección
      setTimeout(() => {
        onLogin(user);
      }, 800);

    } catch {
      setErrors({ general: "Error servidor" });
    }
  };

  return (
    <div className="login-container">

      <div className="login-left">
        <h2 className="logo">🐾 Street Paws</h2>

        <div className="login-text">
          <h1>
            Ayudando a encontrar <span>Hogares Felices</span>
          </h1>
          <p>
            Inicia sesión para gestionar adopciones, seguir
            casos de rescate y conectar con otros amantes
            de los animales.
          </p>
        </div>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <p>Inicia sesión para poder ver lo que tenemos para ti!</p>

          {successMsg && <p className="success">{successMsg}</p>}

          {errors.general && <p className="error">{errors.general}</p>}

          <label>Correo electrónico</label>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="👤 ejemplo@correo.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Contraseña</label>
          <div className="input-box password-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" 🔒 ********"
              value={form.password}
              onChange={handleChange}
            />
            <span onClick={() => setShowPassword(!showPassword)}>👁️</span>
          </div>

          {errors.password && <p className="error">{errors.password}</p>}

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