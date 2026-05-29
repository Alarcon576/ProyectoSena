import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;

client.authentications["api-key"].apiKey =
  process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

export const enviarCorreoRecuperacion = async (
  email,
  enlace
) => {

  await apiInstance.sendTransacEmail({
    sender: {
      email: "noreply@streetpaws.com",
      name: "Street Paws"
    },
    to: [
      {
        email
      }
    ],
    subject: "Recupera tu contraseña",
    htmlContent: `
      <h2>Street Paws</h2>

      <p>Haz clic para recuperar tu contraseña:</p>

      <a href="${enlace}">
        Recuperar contraseña
      </a>

      <p>Este enlace expira en 1 hora.</p>
    `
  });

};