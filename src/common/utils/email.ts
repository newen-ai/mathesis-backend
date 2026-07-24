import { Resend } from "resend";
import { env } from "../../config/env";

const fromAddress = "Mathesis <no-reply@mail.mathesis.social>";

const registrationEmailCopy = {
  greeting: "Hola,",
  intro: "Te has registrado correctamente en Mathesis.",
  confirmationPrompt: "Para confirmar tu registro, haz clic en el siguiente enlace:",
  ignoreNotice: "Si no has realizado este registro, puedes ignorar este mensaje.",
  closingLine: "Atentamente, Equipo de Mathesis"
} as const;

type SendRegistrationEmailInput = {
  to: string;
  confirmUrl: string;
};

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function buildRegistrationEmailContent(confirmUrl: string): { text: string; html: string } {
  return {
    text: [
      registrationEmailCopy.greeting,
      "",
      registrationEmailCopy.intro,
      registrationEmailCopy.confirmationPrompt,
      confirmUrl,
      "",
      registrationEmailCopy.ignoreNotice,
      "",
      registrationEmailCopy.closingLine
    ].join("\n"),
    html: [
      `<p>${registrationEmailCopy.greeting}</p>`,
      `<p>${registrationEmailCopy.intro}</p>`,
      `<p>${registrationEmailCopy.confirmationPrompt}</p>`,
      `<p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
      `<p>${registrationEmailCopy.ignoreNotice}</p>`,
      `<p>Atentamente,<br />Equipo de Mathesis</p>`
    ].join("\n")
  };
}

export async function sendRegistrationEmail(input: SendRegistrationEmailInput): Promise<void> {
  if (!resend) {
    return;
  }

  const content = buildRegistrationEmailContent(input.confirmUrl);

  await resend.emails.send({
    from: fromAddress,
    to: input.to,
    subject: "Confirma tu registro en Mathesis",
    text: content.text,
    html: content.html
  });
}
