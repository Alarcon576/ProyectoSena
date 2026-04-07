import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const orientarSaludMascota = async ({
  especie,
  edad,
  sintomas
}) => {
  const prompt = `
Eres un asistente veterinario de orientación básica.

Tu trabajo es:
- evitar temas como politica, religión, etc. (enfócate solo en salud)
- orientar al dueño
- detectar urgencia
- recomendar si debe ir al veterinario
- dar cuidados básicos en casa
- nunca dar diagnósticos definitivos
- IMPORTANTEEEEE:siempre aclarar que no reemplaza un veterinario

Mascota: ${especie}
Edad: ${edad}
Síntomas: ${sintomas}

Responde en JSON:
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

  return response.output_text;
};