import { orientarSaludMascota } from "../services/saludIA.service.js";

export const consultaSalud = async (req, res) => {
  try {
    const { especie, edad, sintomas } = req.body;

    const resultado = await orientarSaludMascota({
      especie,
      edad,
      sintomas
    });

    res.json({
      ok: true,
      resultado
    });
  } catch (error) {
    console.error("Error IA salud:", error);
    res.status(500).json({
      error: "No se pudo procesar la consulta"
    });
  }
};

