import { useEffect, useState } from "react";
import "./Mascotas.css";

const URL = "http://localhost:3000/api/mascotas";

function Mascotas({ onSwitch, user }) {
  const [mascotas, setMascotas] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    especie: "",
    raza: "",
    edad: "",
    sexo: "",
    estado_salud: "",
    fecha_ingreso: "",
    estado_adopcion: "",
    foto: null // 🔥 NUEVO
  });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const token = localStorage.getItem("token");
  const esAdmin = user?.rol === 2;

  const cargarMascotas = async () => {
    try {
      const res = await fetch(URL);
      const data = await res.json();
      setMascotas(data);
    } catch {
      console.error("Error DB");
    }
  };

  useEffect(() => { cargarMascotas(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, foto: e.target.files[0] });
  };

  const limpiarForm = () => {
    setForm({
      nombre: "",
      especie: "",
      raza: "",
      edad: "",
      sexo: "",
      estado_salud: "",
      fecha_ingreso: "",
      estado_adopcion: "",
      foto: null
    });
  };

  // 🔥 SUBMIT CON FORM DATA
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editando ? "PUT" : "POST";
      const endpoint = editando ? `${URL}/${editando}` : URL;

      const formData = new FormData();

      formData.append("nombre", form.nombre);
      formData.append("especie", form.especie);
      formData.append("raza", form.raza);
      formData.append("edad", form.edad);
      formData.append("sexo", form.sexo);
      formData.append("estado_salud", form.estado_salud);
      formData.append("fecha_ingreso", form.fecha_ingreso);
      formData.append("estado_adopcion", form.estado_adopcion);

      if (form.foto) {
        formData.append("foto", form.foto);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setMensaje({
          texto: editando
            ? "Actualizado correctamente ✅"
            : "¡Mascota creada con imagen! 🐶",
          tipo: "success"
        });

        setEditando(null);
        limpiarForm();
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

    await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setMensaje({ texto: "Eliminado correctamente", tipo: "success" });
    cargarMascotas();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onSwitch("login");
  };

  return (
    <div className="mascotas-container">

      {/* HEADER */}
      <div className="mascotas-header">
        <h2>🐾 Street Paws</h2>

        <div>
          <span className="rol">
            {esAdmin ? "Admin 👑" : "Usuario 👤"}
          </span>

          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="mascotas-content">

        {/* FORM */}
        {esAdmin && (
          <div className="form-card">
            <h3>{editando ? "Editar mascota" : "Nueva mascota"}</h3>

            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
              <input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} />
              <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} />
              <input name="edad" type="number" placeholder="Edad" value={form.edad} onChange={handleChange} />
              <input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} />
              <input name="estado_salud" placeholder="Salud" value={form.estado_salud} onChange={handleChange} />
              <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} />
              <input name="estado_adopcion" placeholder="Adopción" value={form.estado_adopcion} onChange={handleChange} />

              {/* 📸 INPUT FILE */}
              <input type="file" onChange={handleFileChange} />

              <button className="btn-save">
                {editando ? "Actualizar" : "Crear"}
              </button>
            </form>
          </div>
        )}

        {/* TABLA */}
        <div className="table-card">
          <h3>Lista de mascotas</h3>

          {mensaje.texto && (
            <p className={mensaje.tipo === "success" ? "success" : "error"}>
              {mensaje.texto}
            </p>
          )}

          <table>
            <thead>
              <tr>
                <th>Foto</th> {/* 🔥 NUEVO */}
                <th>Nombre</th>
                <th>Especie</th>
                <th>Edad</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id_mascota}>
                  
                  {/* 📸 MOSTRAR IMAGEN */}
                  <td>
                    {m.fotos?.[0] && (
                      <img 
                        src={m.fotos[0].url_foto} 
                        width="60" 
                        style={{ borderRadius: "8px" }}
                      />
                    )}
                  </td>

                  <td>{m.nombre}</td>
                  <td>{m.especie}</td>
                  <td>{m.edad}</td>

                  {esAdmin && (
                    <td>
                      <button onClick={() => {
                        setForm({
                          nombre: m.nombre,
                          especie: m.especie,
                          raza: m.raza,
                          edad: m.edad,
                          sexo: m.sexo,
                          estado_salud: m.estado_salud,
                          fecha_ingreso: m.fecha_ingreso?.split("T")[0] || "",
                          estado_adopcion: m.estado_adopcion,
                          foto: null
                        });

                        setEditando(m.id_mascota);
                      }}>
                        ✏️
                      </button>

                      <button onClick={() => handleEliminar(m.id_mascota)}>
                        🗑️
                      </button>
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Mascotas;