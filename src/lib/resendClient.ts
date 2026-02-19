import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "sanayaromero62@gmail.com";

// Resend client (solo si hay API key)
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
export { resendFromEmail };
