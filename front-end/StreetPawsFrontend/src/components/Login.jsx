import { useState } from "react";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Correo inválido");
      return;
    }

    setError("");
    console.log("Login:", form);

    // Aquí luego conectas API
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "5px"
            }}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {/* ERROR */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* BOTÓN */}
        <button type="submit">Ingresar</button>

        {/* OLVIDÉ CONTRASEÑA */}
        <p
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => alert("......")}
        >
          ¿Olvidaste tu contraseña?
        </p>
      </form>
    </div>
  );
}

export default Login;