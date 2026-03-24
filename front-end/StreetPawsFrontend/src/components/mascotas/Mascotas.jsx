import { useEffect, useState } from "react";
import "./Mascotas.css";

const URL = "http://localhost:3000/api/mascotas";

function Mascotas({ onSwitch, user }) {
  const [mascotas, setMascotas] = useState([]);
  const [form, setForm] = useState({ nombre: "", especie: "", edad: "", fecha_ingreso: "" });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const token = localStorage.getItem("token");
  // Verifica si es admin según el id_rol de tu DB
  const esAdmin = user?.id_rol === 2; 

  const cargarMascotas = async () => {
    const res = await fetch(URL);
    const data = await res.json();
    setMascotas(data);
  };

  useEffect(() => { cargarMascotas(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editando ? "PUT" : "POST";
    const endpoint = editando ? `${URL}/${editando}` : URL;

    const res = await fetch(endpoint, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // <--- Token para verificarToken
      },
      body: JSON.stringify({ ...form, edad: parseInt(form.edad), fecha_ingreso: new Date(form.fecha_ingreso) })
    });

    if (res.ok) {
      setMensaje({ texto: "¡Operación exitosa!", tipo: "success" });
      setEditando(null);
      setForm({ nombre: "", especie: "", edad: "", fecha_ingreso: "" });
      cargarMascotas();
    } else {
      setMensaje({ texto: "No tienes permisos de administrador", tipo: "error" });
    }
  };

  return (
    <div className="mascotas-page">
      <div className="mascotas-card">
        <header style={{display:'flex', justifyContent:'space-between'}}>
          <h2>🐾 Mascotas</h2>
          <button className="btn-delete" onClick={() => { localStorage.removeItem("token"); onSwitch("login"); }}>Cerrar Sesión</button>
        </header>

        {mensaje.texto && <div className={`${mensaje.tipo}-text status-msg`}>{mensaje.texto}</div>}

        {esAdmin && (
          <form className="mascotas-form" onSubmit={handleSubmit}>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={(e)=>setForm({...form, nombre:e.target.value})} required />
            <input name="especie" placeholder="Especie" value={form.especie} onChange={(e)=>setForm({...form, especie:e.target.value})} required />
            <input name="edad" type="number" placeholder="Edad" value={form.edad} onChange={(e)=>setForm({...form, edad:e.target.value})} required />
            <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={(e)=>setForm({...form, fecha_ingreso:e.target.value})} required />
            <button className="btn-save" style={{gridColumn:'1/-1'}}>{editando ? "Actualizar" : "Crear Mascota"}</button>
          </form>
        )}

        <table className="mascotas-table">
          <thead>
            <tr><th>Nombre</th><th>Especie</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {mascotas.map(m => (
              <tr key={m.id_mascota}>
                <td>{m.nombre}</td>
                <td>{m.especie}</td>
                <td>
                  {esAdmin && (
                    <>
                      <button className="btn-edit" onClick={() => { setForm({...m, fecha_ingreso: m.fecha_ingreso.split('T')[0]}); setEditando(m.id_mascota); }}>Editar</button>
                      <button className="btn-delete" onClick={async () => { 
                        await fetch(`${URL}/${m.id_mascota}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${token}` } });
                        cargarMascotas();
                      }}>Borrar</button>
                    </>
                  )}
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