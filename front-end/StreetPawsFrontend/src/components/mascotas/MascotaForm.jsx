import { useState, useEffect } from "react";

function MascotaForm({ onSubmit, mascotaEdit }) {
  const [form, setForm] = useState({
    nombre: "",
    especie: "",
    edad: ""
  });

  useEffect(() => {
    if (mascotaEdit) {
      setForm(mascotaEdit);
    }
  }, [mascotaEdit]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ nombre: "", especie: "", edad: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{mascotaEdit ? "Editar" : "Crear"} Mascota</h3>

      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />

      <input
        name="especie"
        placeholder="Especie"
        value={form.especie}
        onChange={handleChange}
      />

      <input
        name="edad"
        placeholder="Edad"
        value={form.edad}
        onChange={handleChange}
      />

      <button type="submit">
        {mascotaEdit ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
}

export default MascotaForm; 