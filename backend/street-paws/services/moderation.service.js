import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================================================
   UTILIDADES
========================================================= */
const normalizarTexto = (texto = "") => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9\s]/g, " ") // quitar símbolos
    .replace(/\s+/g, " ")
    .trim();
};

const palabrasProhibidas = [
  "hpta",
  "hp",
  "hijueputa",
  "gonorrea",
  "gono",
  "mk",
  "marica",
  "marik",
  "pirobo",
  "piroba",
  "puta",
  "carechimba",
  "cacorro"
];

const palabrasClaveMascotas = [
  "perro",
  "perros",
  "gato",
  "gatos",
  "mascota",
  "mascotas",
  "animal",
  "animales",
  "rescate",
  "adopcion",
  "adoptar",
  "veterinario",
  "veterinaria",
  "cachorro",
  "cachorros",
  "peludo",
  "peludos",
  "huella",
  "huellas",
  "abandono",
  "refugio",
  "esterilizacion",
  "vacuna",
  "vacunas",
  "amor",
  "compañero",
  "amistad",
  "leal",
  "salud",
  "bienestar",
  "domestico",
  "asco",
];

const contieneGroserias = (texto) => {
  const limpio = normalizarTexto(texto);

  return palabrasProhibidas.some((palabra) => {
    const regex = new RegExp(`\\b${palabra}\\b`, "i");
    return regex.test(limpio);
  });
};

const contieneTematicaMascotas = (texto) => {
  const limpio = normalizarTexto(texto);

  return palabrasClaveMascotas.some((palabra) => {
    const regex = new RegExp(`\\b${palabra}\\b`, "i");
    return regex.test(limpio);
  });
};

/* =========================================================
   CAPA 1 - MODERACIÓN OPENAI
========================================================= */
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

/* =========================================================
   CAPA 2 - VALIDACIÓN IA SEMÁNTICA
========================================================= */
export const validarRelevanciaConIA = async (texto) => {
  try {
    const limpio = normalizarTexto(texto);

    if (contieneGroserias(limpio)) {
      return false;
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Responde únicamente con true o false.

Reglas:
- true SOLO si el texto trata claramente sobre mascotas,
  perros, gatos, adopción, rescate animal, veterinaria,
  bienestar animal o animales domésticos.
- false si contiene groserías.
- false si contiene insultos o abreviaciones ofensivas colombianas.
- false si habla de mascotas en memes, roleplay, bromas,
  therians o contextos irrelevantes.
- false si no tiene intención real sobre animales.

Texto: "${limpio}"
      `
    });

    const resultado = response.output_text.trim().toLowerCase();
    return resultado === "true";
  } catch (error) {
    console.error("Error IA relevancia:", error);
    return false;
  }
};

/* =========================================================
   FUNCIÓN FINAL - VALIDAR PUBLICACIÓN
========================================================= */
export const validarPublicacion = async (texto) => {
  try {
    const limpio = normalizarTexto(texto);

    if (!limpio) {
      return {
        valido: false,
        motivo: "El texto está vacío"
      };
    }

    // CAPA 1 → Moderación OpenAI
    const moderacion = await moderarTexto(limpio);

    if (moderacion.flagged) {
      return {
        valido: false,
        motivo: "Contenido bloqueado por moderación"
      };
    }

    // CAPA 2 → Groserías locales
    if (contieneGroserias(limpio)) {
      return {
        valido: false,
        motivo: "Contiene lenguaje ofensivo"
      };
    }

    // CAPA 3 → Validación rápida por temática
    const tieneTemaMascotas = contieneTematicaMascotas(limpio);

    if (!tieneTemaMascotas) {
      return {
        valido: false,
        motivo: "La publicación no está relacionada con mascotas"
      };
    }

    // CAPA 4 → Validación IA semántica
    const esRelevante = await validarRelevanciaConIA(limpio);

    if (!esRelevante) {
      return {
        valido: false,
        motivo: "La IA detectó contexto no relacionado con mascotas"
      };
    }

    return {
      valido: true,
      motivo: "Contenido aprobado"
    };
  } catch (error) {
    console.error("Error validando publicación:", error);

    return {
      valido: false,
      motivo: "Error interno validando contenido"
    };
  }
};