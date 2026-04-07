import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const validarTemaMascota = async (imageUrl) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Analiza la imagen y responde únicamente con SI o NO. SI si la imagen contiene mascotas, perros, gatos, animales domésticos, rescate animal, veterinaria o adopción. NO si no tiene relación con mascotas."
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "¿La imagen está relacionada con mascotas?"
            },
            {
              type: "input_image",
              image_url: imageUrl
            }
          ]
        }
      ]
    });

    const texto = response.output_text?.toLowerCase() || "";

    return {
      relacionado:
        texto.includes("si") ||
        texto.includes("sí")
    };
  } catch (error) {
    console.error("Error validando tema de imagen:", error);
    throw error;
  }
};