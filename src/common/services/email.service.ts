import { env } from "../../config/env";

export type VerificationEmailPayload = {
  email: string;
  verificationUrl: string;
};

export type VerificationEmailResult = {
  sent: boolean;
  id?: string;
};

type ResendEmailResponse = {
  id?: string;
};

export async function sendVerificationEmail(payload: VerificationEmailPayload): Promise<VerificationEmailResult> {
  if (!env.RESEND_API_KEY) {
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.email],
      subject: "Confirma tu correo en Mathesis",
      html: `
        <p>Hola,</p>
        <p>Gracias por registrarte en Mathesis. Para confirmar tu correo, hacé clic en el siguiente enlace:</p>
        <p><a href="${payload.verificationUrl}">Confirmar correo</a></p>
        <p>Si no pediste esta cuenta, podés ignorar este mensaje.</p>
      `
    })
  });

  if (!response.ok) {
    return { sent: false };
  }

  try {
    const body = (await response.json()) as ResendEmailResponse;
    if (typeof body.id === "string" && body.id.trim().length > 0) {
      return { sent: true, id: body.id };
    }

    return { sent: false };
  } catch {
    return { sent: false };
  }
}
