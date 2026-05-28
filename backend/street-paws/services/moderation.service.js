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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* =========================================================
   GROSERÍAS FUERTES
========================================================= */
const palabrasProhibidas = [
  "hijueputa",
  "gonorrea",
  "pirobo",
  "carechimba"
];

const contieneGroserias = (texto) => {
  const limpio = normalizarTexto(texto);

  return palabrasProhibidas.some((palabra) => {
    const regex = new RegExp(`\\b${palabra}\\b`, "i");
    return regex.test(limpio);
  });
};

/* =========================================================
   MODERACIÓN OPENAI
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
   VALIDACIÓN IA MÁS FLEXIBLE
========================================================= */
export const validarRelevanciaConIA = async (texto) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Responde únicamente con true o false.

Aprueba (true) si:
- El texto tiene relación con mascotas, animales,
  adopciones, rescates, veterinaria o experiencias personales.
- También aprueba textos casuales o sociales normales.

Rechaza (false) SOLO si:
- Es spam.
- Es ofensivo.
- Habla de violencia explícita.
- Es completamente irrelevante o absurdo.
- Tiene insultos fuertes.

Texto:
"${texto}"
      `
    });

    const resultado = response.output_text.trim().toLowerCase();

    return resultado.includes("true");
  } catch (error) {
    console.error("Error IA relevancia:", error);

    // En caso de error mejor permitir
    return true;
  }
};

/* =========================================================
   VALIDAR PUBLICACIÓN
========================================================= */
export const validarPublicacion = async (texto) => {
  try {
    const limpio = normalizarTexto(texto);

    if (!limpio || limpio.length < 3) {
      return {
        valido: false,
        motivo: "Texto demasiado corto"
      };
    }

    // 1. Moderación OpenAI
    const moderacion = await moderarTexto(limpio);

    if (moderacion.flagged) {
      return {
        valido: false,
        motivo: "Contenido bloqueado por moderación"
      };
    }

    // 2. Groserías fuertes
    if (contieneGroserias(limpio)) {
      return {
        valido: false,
        motivo: "Lenguaje ofensivo"
      };
    }

    // 3. Validación IA flexible
    const esValido = await validarRelevanciaConIA(limpio);

    if (!esValido) {
      return {
        valido: false,
        motivo: "Contenido no permitido"
      };
    }

    return {
      valido: true,
      motivo: "Contenido aprobado"
    };
  } catch (error) {
    console.error("Error validando publicación:", error);

    // MUY IMPORTANTE:
    // no bloquees publicaciones por errores internos
    return {
      valido: true,
      motivo: "Publicado con validación parcial"
    };
  }
};