import { useState } from "react";
import "./Auth.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};

    if (!form.name) err.name = "Nombre obligatorio";
    if (!form.email) err.email = "Correo obligatorio";
    else if (!form.email.includes("@")) err.email = "Correo inválido";

    if (!form.password) err.password = "Contraseña obligatoria";
    if (!form.address) err.address = "Dirección obligatoria";
    if (!form.phone) err.phone = "Teléfono obligatorio";

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
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.name,
          email: form.email,
          contrasena: form.password,
          direccion: form.address,
          telefono: form.phone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.msg });
        return;
      }

      setSuccess("Usuario registrado ");

    } catch {
      setErrors({ general: "Error servidor" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Únete a nuestra comunidad :p</h1>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Crear cuenta</h2>

          <input name="name" placeholder="Nombre" onChange={handleChange} />
          {errors.name && <p className="error">{errors.name}</p>}

          <input name="email" placeholder="Correo" onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
          {errors.password && <p className="error">{errors.password}</p>}
          

          <input name="address" placeholder="Dirección" onChange={handleChange} />
          {errors.address && <p className="error">{errors.address}</p>}

          <input name="phone" type="number" placeholder="Teléfono" onChange={handleChange} />
          {errors.phone && <p className="error">{errors.phone}</p>}

          {errors.general && <p className="error">{errors.general}</p>}
          {success && <p className="success">{success}</p>}

          <button>Crear cuenta</button>
        </form>
      </div>
    </div>
  );
}

export default Register;