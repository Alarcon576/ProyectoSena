import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const moderarImagen = async (imageUrl) => {
  const response = await client.moderations.create({
    model: "omni-moderation-latest",
    input: [
      {
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      }
    ]
  });

  return response.results[0];
};