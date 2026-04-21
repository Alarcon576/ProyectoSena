import { useEffect, useState } from "react";
import "./Configuracion.css";

const API = "http://localhost:3000/api";

function Configuracion({ onSwitch }) {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const res = await fetch(`${API}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setUser(data);
    setNombre(data.nombre);
    setEmail(data.email);
  };

  const guardar = async () => {
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          email,
          contrasena: password || undefined
        })
      });

      const data = await res.json();

      alert("Perfil actualizado correctamente");
      setPassword("");
    } catch (err) {
      console.error(err);
      alert("Error actualizando perfil");
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="config-container">

      <h2>⚙️ Configuración</h2>

      <div className="config-card">

        <label>Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Nueva contraseña</label>
        <input
          type="password"
          placeholder="Opcional"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={guardar}>
          Guardar cambios
        </button>

      </div>
    </div>
  );
}

export default Configuracion;