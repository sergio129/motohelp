import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { emailPasswordReset } from "./emailTemplates";
import { resend } from "./resendClient";

const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = Number.parseInt((process.env.SMTP_PORT || "587").trim(), 10);
const smtpSecureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
const smtpSecure = smtpSecureEnv
  ? smtpSecureEnv === "true"
  : smtpPort === 465;

type SmtpPreset = {
  port: number;
  secure: boolean;
  label: string;
};

function getSmtpPresets(): SmtpPreset[] {
  const primary: SmtpPreset = {
    port: smtpPort,
    secure: smtpSecure,
    label: `primary:${smtpPort}/${smtpSecure ? "secure" : "starttls"}`,
  };

  const fallback: SmtpPreset = smtpPort === 465
    ? { port: 587, secure: false, label: "fallback:587/starttls" }
    : { port: 465, secure: true, label: "fallback:465/secure" };

  return primary.port === fallback.port && primary.secure === fallback.secure
    ? [primary]
    : [primary, fallback];
}

function createTransporter(preset: SmtpPreset) {
  const transportOptions: SMTPTransport.Options = {
    host: smtpHost,
    port: preset.port,
    secure: preset.secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    // En algunos entornos serverless, STARTTLS estricto falla por red intermedia
    requireTLS: false,
    tls: {
      servername: smtpHost,
      minVersion: "TLSv1.2",
    },
  };

  return nodemailer.createTransport(transportOptions);
}

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(options: EmailOptions, retries = 3) {
  // Intentar Resend primero si está configurado
  if (resend) {
    try {
      console.log(`📧 Intento Resend enviando email a ${options.to}`);
      const result = await resend.emails.send({
        from: `MotoHelp <sanayaromero62@gmail.com>`, // Cambiar a tu dominio verificado
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
      console.error(`❌ Resend falló, intentando SMTP:`, error?.message);
      // Continuar con SMTP como fallback
    }
  }

  // Fallback: intentar SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    const error = new Error("SMTP_USER o SMTP_PASSWORD no está configurado");
    console.error("❌ Error de configuración SMTP:", error.message);
    return { success: false, error };
  }

  let lastError;
  const presets = getSmtpPresets();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const preset = presets[(attempt - 1) % presets.length];
    const transporter = createTransporter(preset);

    try {
      console.log(
        `📧 Intento ${attempt}/${retries} enviando email a ${options.to} usando ${preset.label}`
      );
      
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
      console.error(
        `❌ Error en intento ${attempt}/${retries}:`,
        error?.message,
        {
          code: error?.code,
          command: error?.command,
          responseCode: error?.responseCode,
        }
      );
      
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
  const presets = getSmtpPresets();

  for (const preset of presets) {
    try {
      const transporter = createTransporter(preset);
      await transporter.verify();
      console.log(`✅ Servidor SMTP listo para enviar emails (${preset.label})`);
      return true;
    } catch (error) {
      console.error(`❌ Error en configuración SMTP (${preset.label}):`, error);
    }
  }

  return false;
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
