import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"MotoHelp" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Fallback a texto plano
    });

    console.log("✅ Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    return { success: false, error };
  }
}

// Verificar conexión de SMTP
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Servidor SMTP listo para enviar emails");
    return true;
  } catch (error) {
    console.error("❌ Error en configuración SMTP:", error);
    return false;
  }
}
