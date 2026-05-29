export const obtenerNoticias = async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;

    const response = await fetch(
      `https://gnews.io/api/v4/search?q=mascotas OR perros OR gatos OR adopcion animal&lang=es&max=10&apikey=${apiKey}`
    );

    const data = await response.json();

    res.json(data.articles);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo noticias"
    });
  }
};