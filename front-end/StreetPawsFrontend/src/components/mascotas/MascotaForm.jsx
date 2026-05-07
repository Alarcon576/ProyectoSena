
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
    estado_adopcion: "",
    foto: null
  });

  useEffect(() => {
    if (mascotaEdit) {
      setForm({
        ...mascotaEdit,
        fecha_ingreso: mascotaEdit.fecha_ingreso?.split("T")[0] || "",
        foto: null // 🔥 importante (no forzar imagen al editar)
      });
    }
  }, [mascotaEdit]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, foto: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // VALIDACIONES
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    if (!form.especie) {
      alert("Debe seleccionar una especie");
      return;
    }

    if (!form.raza.trim()) {
      alert("La raza es obligatoria");
      return;
    }

    if (!form.edad || isNaN(form.edad) || form.edad <= 0) {
      alert("Ingrese una edad válida");
      return;
    }

    if (!form.sexo) {
      alert("Debe seleccionar el sexo");
      return;
    }

    if (!form.estado_salud.trim()) {
      alert("El estado de salud es obligatorio");
      return;
    }

    if (!form.fecha_ingreso) {
      alert("Debe seleccionar la fecha de ingreso");
      return;
    }

    if (!form.estado_adopcion) {
      alert("Debe seleccionar el estado de adopción");
      return;
    }

    // 🔥 VALIDACIÓN IMAGEN
    if (!form.foto && !mascotaEdit) {
      alert("La imagen es obligatoria");
      return;
    }

    // 🔥 FORM DATA (para enviar imagen)
    const formData = new FormData();

    formData.append("nombre", form.nombre);
    formData.append("especie", form.especie);
    formData.append("raza", form.raza);
    formData.append("edad", parseInt(form.edad));
    formData.append("sexo", form.sexo);
    formData.append("estado_salud", form.estado_salud);
    formData.append("fecha_ingreso", form.fecha_ingreso);
    formData.append("estado_adopcion", form.estado_adopcion);

    if (form.foto) {
      formData.append("foto", form.foto);
    }

    onSubmit(formData);

    // LIMPIAR FORMULARIO
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

  return (
    <form onSubmit={handleSubmit}>
      <h3>{mascotaEdit ? "Editar" : "Crear"} Mascota</h3>

      <input 
        name="nombre" 
        placeholder="Nombre" 
        value={form.nombre} 
        onChange={handleChange} 
      />

      <select 
        name="especie" 
        value={form.especie} 
        onChange={handleChange}
      >
        <option value="">Seleccione especie</option>
        <option value="Perro">Perro</option>
        <option value="Gato">Gato</option>
      </select>

      <input 
        name="raza" 
        placeholder="Raza" 
        value={form.raza} 
        onChange={handleChange} 
      />

      <input 
        name="edad" 
        type="number" 
        placeholder="Edad" 
        value={form.edad} 
        onChange={handleChange} 
      />

      <select 
        name="sexo" 
        value={form.sexo} 
        onChange={handleChange}
      >
        <option value="">Seleccione sexo</option>
        <option value="Macho">Macho</option>
        <option value="Hembra">Hembra</option>
      </select>

      <textarea 
        name="estado_salud" 
        placeholder="Estado de salud" 
        value={form.estado_salud} 
        onChange={handleChange} 
      />

      <input 
        name="fecha_ingreso" 
        type="date" 
        value={form.fecha_ingreso} 
        onChange={handleChange} 
      />

      <select 
        name="estado_adopcion" 
        value={form.estado_adopcion} 
        onChange={handleChange}
      >
        <option value="">Seleccione estado</option>
        <option value="Disponible">Disponible</option>
        <option value="No disponible">No disponible</option>
      </select>

      {/* 🔥 INPUT DE IMAGEN */}
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
      />

      <button type="submit">
        {mascotaEdit ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
}

export default MascotaForm;
