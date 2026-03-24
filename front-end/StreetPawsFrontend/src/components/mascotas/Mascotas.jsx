import { useEffect, useState } from "react";
import "./Mascotas.css";

const URL = "http://localhost:3000/api/mascotas";

function Mascotas({ onSwitch }) {
  const [mascotas, setMascotas] = useState([]);
  const [form, setForm] = useState({ nombre: "", especie: "", edad: "" });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const cargarMascotas = async () => {
    try {
      const res = await fetch(URL);
      const data = await res.json();
      setMascotas(data);
    } catch { console.error("Error DB"); }
  };

  useEffect(() => { cargarMascotas(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.especie || !form.edad) {
      setMensaje({ texto: "Todos los campos son obligatorios", tipo: "error" });
      return;
    }

    try {
      const method = editando ? "PUT" : "POST";
      const endpoint = editando ? `${URL}/${editando}` : URL;
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setMensaje({ texto: editando ? "Actualizado correctamente ✅" : "¡Mascota creada! 🐶", tipo: "success" });
        setEditando(null);
        setForm({ nombre: "", especie: "", edad: "" });
        cargarMascotas();
      } else {
        setMensaje({ texto: "Error al guardar datos", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de servidor", tipo: "error" });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar mascota?")) return;
    await fetch(`${URL}/${id}`, { method: "DELETE" });
    setMensaje({ texto: "Eliminado correctamente", tipo: "success" });
    cargarMascotas();
  };

  return (
    <div className="mascotas-page">
      <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '10px' }}>
        <button onClick={() => onSwitch("login")} style={{background: 'none', border: 'none', color: '#f29933', cursor: 'pointer', fontWeight: 'bold'}}>
          ← Volver al inicio
        </button>
      </div>

      <div className="mascotas-card">
        <h2>🐾 Gestión de Mascotas</h2>
        
        {mensaje.texto && (
          <p className={mensaje.tipo === "success" ? "success-text" : "error-text"} style={{textAlign: 'center', marginBottom: '15px'}}>
            {mensaje.texto}
          </p>
        )}

        <form className="mascotas-form" onSubmit={handleSubmit}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          <input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} />
          <input name="edad" placeholder="Edad" value={form.edad} onChange={handleChange} />
          <button type="submit" className="btn-save">{editando ? "Actualizar" : "Crear"}</button>
        </form>

        <table className="mascotas-table">
          <thead><tr><th>Nombre</th><th>Especie</th><th>Edad</th><th>Acciones</th></tr></thead>
          <tbody>
            {mascotas.map((m) => (
              <tr key={m.id_mascota}>
                <td>{m.nombre}</td>
                <td>{m.especie}</td>
                <td>{m.edad}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setForm(m); setEditando(m.id_mascota); }}>Editar</button>
                  <button className="btn-delete" onClick={() => handleEliminar(m.id_mascota)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Mascotas;