import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

// Resend client (solo si hay API key)
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Enviar email primero por Resend, fallback a SMTP si no está configurado
 */
export async function sendEmailViaResend(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    throw new Error("RESEND_API_KEY no está configurado");
  }

  try {
    const result = await resend.emails.send({
      from: `MotoHelp <noreply@resend.dev>`, // Cambiar a tu dominio verificado en Resend
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log("✅ Email enviado via Resend:", result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error("❌ Error en Resend:", error?.message);
    throw error;
  }
}
