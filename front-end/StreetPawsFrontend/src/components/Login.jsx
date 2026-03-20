import { useState } from "react";
import "./Auth.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};

    if (!form.email) err.email = "Correo obligatorio";
    else if (!form.email.includes("@")) err.email = "Correo inválido";

    if (!form.password) err.password = "Contraseña obligatoria";

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      alert("Bienvenido ");

    } catch {
      setErrors({ general: "Error servidor" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Ayudando a encontrar hogares felices </h1>
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
          {errors.email && <p className="error">{errors.email}</p>}

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                cursor: "pointer"
              }}
            >
              mostrar
            </span>
          </div>

          {errors.password && <p className="error">{errors.password}</p>}
          {errors.general && <p className="error">{errors.general}</p>}

          <button>Ingresar</button>

        
        </form>
      </div>
    </div>
  );
}

export default Login;