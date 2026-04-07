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

  const [mensajeForm, setMensajeForm] = useState({ texto: "", tipo: "" });
  const [mensajeGlobal, setMensajeGlobal] = useState({ texto: "", tipo: "" });

  const [mostrarForm, setMostrarForm] = useState(false);

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

  useEffect(() => {
    cargarMascotas();
  }, []);

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

    if (!form.nombre.trim()) {
      setMensajeForm({ texto: "El nombre es obligatorio", tipo: "error" });
      return;
    }

    if (!form.especie) {
      setMensajeForm({ texto: "Debe seleccionar una especie", tipo: "error" });
      return;
    }

    if (!form.raza.trim()) {
      setMensajeForm({ texto: "La raza es obligatoria", tipo: "error" });
      return;
    }

    if (!form.edad || isNaN(form.edad) || form.edad <= 0) {
      setMensajeForm({ texto: "Ingrese una edad válida", tipo: "error" });
      return;
    }

    if (!form.sexo) {
      setMensajeForm({ texto: "Debe seleccionar el sexo", tipo: "error" });
      return;
    }

    if (!form.estado_salud.trim()) {
      setMensajeForm({ texto: "El estado de salud es obligatorio", tipo: "error" });
      return;
    }

    if (!form.fecha_ingreso) {
      setMensajeForm({ texto: "Debe seleccionar la fecha de ingreso", tipo: "error" });
      return;
    }

    if (!form.estado_adopcion) {
      setMensajeForm({ texto: "Debe seleccionar el estado de adopción", tipo: "error" });
      return;
    }

    try {
      const method = editando ? "PUT" : "POST";
      const endpoint = editando ? `${URL}/${editando}` : URL;

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setMensajeGlobal({
          texto: editando
            ? "Actualizado correctamente"
            : "¡Mascota creada correctamente!",
          tipo: "success"
        });

        setEditando(null);
        limpiarForm();
        setMostrarForm(false);
        setMensajeForm({ texto: "", tipo: "" });
        cargarMascotas();
      } else {
        setMensajeGlobal({ texto: "Error al guardar datos", tipo: "error" });
      }

    } catch {
      setMensajeGlobal({ texto: "Error de servidor", tipo: "error" });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar una mascota?")) return;

    await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setMensajeGlobal({ texto: "Eliminado correctamente", tipo: "success" });
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

        {esAdmin && mostrarForm && (
          <div className="modal-overlay">
            <div className="form-card modal">
              <h3>{editando ? "Editar mascota" : "Nueva mascota"}</h3>

              <form onSubmit={handleSubmit}>
                {mensajeForm.texto && (
                  <p className="error">{mensajeForm.texto}</p>
                )}

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

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="table-card">

          {esAdmin && (
            <button
              className="btn-nueva"
              onClick={() => {
                limpiarForm();
                setEditando(null);
                setMensajeForm({ texto: "", tipo: "" });
                setMostrarForm(true);
              }}
            >
              + Nueva mascota
            </button>
          )}

          <h3>Lista de mascotas</h3>

          {mensajeGlobal.texto && (
            <p className={mensajeGlobal.tipo === "success" ? "success" : "error"}>
              {mensajeGlobal.texto}
            </p>
          )}

          <div className="cards-container">
            {mascotas.map((m) => (
              <div key={m.id_mascota} className="card-mascota">

                {/* ETIQUETA */}
                <span
                  className={
                    m.estado_adopcion === "Disponible"
                      ? "badge disponible"
                      : "badge no-disponible"
                  }
                >
                  {m.estado_adopcion}
                </span>

                {m.fotos?.[0] && (
                  <img src={m.fotos[0].url_foto} className="card-img" />
                )}

                <div className="card-body">
                  <h4>{m.nombre}</h4>
                  <p><strong>Especie:</strong> {m.especie}</p>
                  <p><strong>Raza:</strong> {m.raza}</p>
                  <p><strong>Edad:</strong> {m.edad}</p>
                  <p><strong>Sexo:</strong> {m.sexo}</p>
                  <p><strong>Estado de Salud:</strong> {m.estado_salud}</p>
                  <p><strong>Fecha:</strong> {m.fecha_ingreso?.split("T")[0]}</p>
                </div>

                {esAdmin && (
                  <div className="card-actions">
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
                      setMensajeForm({ texto: "", tipo: "" });
                      setMostrarForm(true);
                    }}>
                      ✏️
                    </button>

                    <button onClick={() => handleEliminar(m.id_mascota)}>
                      🗑️
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Mascotas;