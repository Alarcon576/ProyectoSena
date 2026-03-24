import { useState, useEffect } from "react";

function MascotaForm({ onSubmit, mascotaEdit }) {
  const [form, setForm] = useState({
    nombre: "",
    especie: "",
    raza: "",
    edad: "",
    sexo: "",
    estado_salud: "",
    fecha_ingreso: "",
    estado_adopcion: ""
  });

  useEffect(() => {
    if (mascotaEdit) {
      setForm({
        ...mascotaEdit,
        fecha_ingreso: mascotaEdit.fecha_ingreso?.split("T")[0] || ""
      });
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{mascotaEdit ? "Editar" : "Crear"} Mascota</h3>

      <input name="nombre" value={form.nombre} onChange={handleChange} />
      <input name="especie" value={form.especie} onChange={handleChange} />
      <input name="raza" value={form.raza} onChange={handleChange} />
      <input name="edad" type="number" value={form.edad} onChange={handleChange} />

      <button type="submit">
        {mascotaEdit ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
}

export default MascotaForm;