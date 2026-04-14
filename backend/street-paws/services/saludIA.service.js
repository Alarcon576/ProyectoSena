import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const orientarSaludMascota = async ({
  id_usuario,
  especie,
  edad,
  sintomas
}) => {
  const historial = await prisma.historial_IA_Salud.findMany({
    where: {
      id_usuario
    },
    orderBy: {
      fecha: "desc"
    },
    take: 5
  });

  const contexto = historial
    .map(
      (h) =>
        `Consulta previa: ${h.consulta}\nRespuesta: ${h.respuesta}`
    )
    .join("\n");

  const prompt = `
Eres un asistente veterinario de orientación básica.

Tu trabajo es:
- enfocarte solo en salud animal
- orientar al dueño
- detectar urgencia
- recomendar si debe ir al veterinario
- dar cuidados básicos
- nunca dar diagnósticos definitivos
- siempre aclarar que no reemplaza un veterinario

Historial reciente del usuario:
${contexto || "Sin historial previo"}

Mascota: ${especie}
Edad: ${edad}
Síntomas actuales: ${sintomas}

Responde SOLO en JSON:
{
  "nivel": "leve | moderado | urgente",
  "orientacion": "...",
  "recomendacion": "..."
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const respuestaIA = response.output_text;

  await prisma.historial_IA_Salud.create({
    data: {
      id_usuario,
      consulta: `${especie} | ${edad} | ${sintomas}`,
      respuesta: respuestaIA
    }
  });

  return respuestaIA;
};