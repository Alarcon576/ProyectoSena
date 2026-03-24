import { useState, useEffect } from "react";

function MascotaForm({ onSubmit, mascotaEdit }) {
  const [form, setForm] = useState({
    nombre: "", especie: "", raza: "", edad: "",
    sexo: "", estado_salud: "", fecha_ingreso: "", estado_adopcion: ""
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      edad: parseInt(form.edad),
      fecha_ingreso: new Date(form.fecha_ingreso)
    });
    setForm({
      nombre: "", especie: "", raza: "", edad: "",
      sexo: "", estado_salud: "", fecha_ingreso: "", estado_adopcion: ""
    });
  };

  return (
    <div className="mascotas-form-container">
      <h3 style={{ marginBottom: "15px", color: "#f29933" }}>
        {mascotaEdit ? "Editar Mascota" : "Nueva Mascota"}
      </h3>
      <form className="mascotas-form" onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} required />
        <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} />
        <input name="edad" type="number" placeholder="Edad" value={form.edad} onChange={handleChange} required />
        <input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} />
        <input name="estado_salud" placeholder="Estado de salud" value={form.estado_salud} onChange={handleChange} />
        <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} required />
        <input name="estado_adopcion" placeholder="Estado adopción" value={form.estado_adopcion} onChange={handleChange} />

        <button type="submit" className="btn-save" style={{ gridColumn: "1 / -1" }}>
          {mascotaEdit ? "Guardar Cambios" : "Crear Registro"}
        </button>
      </form>
    </div>
  );
}

export default MascotaForm;