import nodemailer from "nodemailer";
import { emailPasswordReset } from "./emailTemplates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Configuración mejorada para evitar cierres de conexión
  pool: true, // Usar conexiones en pool
  maxConnections: 1, // Limitar a 1 conexión simultánea para Gmail
  maxMessages: 3, // Máximo 3 mensajes por conexión
  rateDelta: 1000, // 1 segundo entre mensajes
  rateLimit: 1, // 1 mensaje por segundo
  connectionTimeout: 10000, // 10 segundos timeout de conexión
  greetingTimeout: 10000, // 10 segundos para greeting
  socketTimeout: 30000, // 30 segundos socket timeout
});

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(options: EmailOptions, retries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📧 Intento ${attempt}/${retries} enviando email a ${options.to}`);
      
      const info = await transporter.sendMail({
        from: `"MotoHelp" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""), // Fallback a texto plano
      });

      console.log("✅ Email enviado:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Error en intento ${attempt}/${retries}:`, error.message);
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < retries) {
        const waitTime = attempt * 2000; // Backoff exponencial: 2s, 4s, 6s
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error("❌ Error al enviar email después de todos los intentos:", lastError);
  return { success: false, error: lastError };
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

/**
 * Enviar email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetUrl: string
) {
  const html = emailPasswordReset({ userName, resetUrl });
  
  return sendEmail({
    to: email,
    subject: "Reestablece tu contraseña en MotoHelp",
    html,
  });
}
