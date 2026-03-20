import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.address ||
      !form.phone
    ) {
      setError("Todos los campos son obligatorios");
      setSuccess("");
      return;
    }

    // Validación básica de correo
    if (!form.email.includes("@")) {
      setError("Correo inválido");
      setSuccess("");
      return;
    }

    // Validación básica de teléfono (solo números)
    if (isNaN(form.phone)) {
      setError("El teléfono debe ser numérico");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("Usuario registrado correctamente ✅");

    console.log("Registro:", form);

    // Aquí luego conectas la API
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Registro</h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Dirección"
          value={form.address}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={handleChange}
        />

        {/* MENSAJES */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;