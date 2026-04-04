import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
  CAPA 1
  Moderación de seguridad:
  violencia, odio, amenazas, sexual, etc.
*/
export const moderarTexto = async (texto) => {
  try {
    const response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: texto
    });

    return response.results[0];
  } catch (error) {
    console.error("Error moderación IA:", error);
    throw error;
  }
};

/*
  CAPA 2A
  Validación rápida por palabras clave
*/
export const validarTematicaMascotas = (texto) => {
  const palabrasClave = [
    "perro",
    "gato",
    "mascota",
    "animal",
    "rescate",
    "adopción",
    "adoptar",
    "veterinario",
    "cachorro",
    "peludo",
    "huella",
    "abandono",
    "refugio",
    "esterilización",
    "vacuna"
  ];

  const textoLower = texto.toLowerCase();

  return palabrasClave.some((palabra) =>
    textoLower.includes(palabra)
  );
};

/*
  CAPA 2B
  IA semántica para validar relevancia
*/
export const validarRelevanciaConIA = async (texto) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
      Responde solo true o false.

      ¿El siguiente texto está relacionado con mascotas,
      rescate animal, adopción, veterinaria o bienestar animal?

      Texto: "${texto}"
      `
    });

    const resultado = response.output_text
      .toLowerCase()
      .trim();

    return resultado.includes("true");
  } catch (error) {
    console.error("Error IA relevancia:", error);
    return false;
  }
};