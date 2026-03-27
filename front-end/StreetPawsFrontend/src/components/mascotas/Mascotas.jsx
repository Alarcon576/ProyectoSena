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
    foto: null
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIONES
    if (!form.nombre.trim()) {
      setMensaje({ texto: "El nombre es obligatorio", tipo: "error" });
      return;
    }

    if (!form.especie) {
      setMensaje({ texto: "Debe seleccionar una especie", tipo: "error" });
      return;
    }

    if (!form.raza.trim()) {
      setMensaje({ texto: "La raza es obligatoria", tipo: "error" });
      return;
    }

    if (!form.edad || isNaN(form.edad) || form.edad <= 0) {
      setMensaje({ texto: "Ingrese una edad válida", tipo: "error" });
      return;
    }

    if (!form.sexo) {
      setMensaje({ texto: "Debe seleccionar el sexo", tipo: "error" });
      return;
    }

    if (!form.estado_salud.trim()) {
      setMensaje({ texto: "El estado de salud es obligatorio", tipo: "error" });
      return;
    }

    if (!form.fecha_ingreso) {
      setMensaje({ texto: "Debe seleccionar la fecha de ingreso", tipo: "error" });
      return;
    }

    if (!form.estado_adopcion) {
      setMensaje({ texto: "Debe seleccionar el estado de adopción", tipo: "error" });
      return;
    }

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
            ? "Actualizado correctamente"
            : "¡Mascota creada con imagen!",
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

      <div className="mascotas-header">
        <h2>🐾 Street Paws</h2>

        <div>
          <span className="rol">
            {esAdmin ? "Admin" : "Usuario"}
          </span>

          <button onClick={handleLogout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="mascotas-content">

        {esAdmin && (
          <div className="form-card">
            <h3>{editando ? "Editar mascota" : "Nueva mascota"}</h3>

            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
              <select name="especie" value={form.especie} onChange={handleChange}>
                <option value="">Seleccione especie</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
              <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} />
              <input name="edad" type="number" placeholder="Edad" value={form.edad} onChange={handleChange} />
              <select name="sexo" value={form.sexo} onChange={handleChange}>
                <option value="">Seleccione sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              <textarea name="estado_salud" placeholder="Estado de salud" value={form.estado_salud} onChange={handleChange} />
              <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} />
              <select name="estado_adopcion" value={form.estado_adopcion} onChange={handleChange}>
                <option value="">Seleccione estado</option>
                <option value="Disponible">Disponible</option>
                <option value="No disponible">No disponible</option>
              </select>

              <input type="file" onChange={handleFileChange} />

              <button className="btn-save">
                {editando ? "Actualizar" : "Crear"}
              </button>
            </form>
          </div>
        )}

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
                <th>Foto</th>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Edad</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id_mascota}>
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