/**
 * Templates de emails para MotoHelp
 * Todos los templates usan HTML inline styles para compatibilidad con clientes de email
 */

// Obtener la URL base de la aplicación
function getBaseUrl(): string {
  // En producción, usar NEXTAUTH_URL si está definida
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // En Vercel, usar la URL automática
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback a URL de producción conocida
  return "https://motohelp-iota.vercel.app";
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
`;

const headerStyles = `
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  padding: 30px 20px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #f97316;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 20px 0;
`;

/**
 * Email cuando mecánico acepta solicitud del cliente
 */
export function emailMechanicAccepted(data: {
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
  mechanicPhone?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 ¡Tu solicitud fue aceptada!</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.clientName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Buenas noticias! <strong>${data.mechanicName}</strong> ha aceptado tu solicitud de servicio.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
              <p style="margin: 5px 0;"><strong>Dirección:</strong> ${data.address}</p>
              ${data.mechanicPhone ? `<p style="margin: 5px 0;"><strong>Teléfono del mecánico:</strong> ${data.mechanicPhone}</p>` : ""}
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">
              El mecánico se pondrá en camino pronto. Te notificaremos cuando esté en ruta.
            </p>
            <a href="${getBaseUrl()}/dashboard/client" style="${buttonStyles}">
              Ver mi solicitud
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Gracias por confiar en MotoHelp 🏍️
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email cuando mecánico está en camino
 */
export function emailMechanicOnWay(data: {
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
  estimatedTime?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚗 ¡El mecánico está en camino!</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.clientName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.mechanicName}</strong> ya está en camino hacia tu ubicación.
            </p>
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
              <p style="margin: 5px 0;"><strong>Destino:</strong> ${data.address}</p>
              ${data.estimatedTime ? `<p style="margin: 5px 0;"><strong>Tiempo estimado:</strong> ${data.estimatedTime}</p>` : ""}
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Por favor, asegúrate de estar en la ubicación indicada.
            </p>
            <a href="${getBaseUrl()}/dashboard/client" style="${buttonStyles}">
              Ver estado del servicio
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email cuando mecánico inicia el servicio
 */
export function emailServiceInProgress(data: {
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔧 ¡Servicio iniciado!</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.clientName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.mechanicName}</strong> ha iniciado el servicio de <strong>${data.serviceName}</strong>.
            </p>
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>🔧 Estado:</strong> En proceso</p>
              <p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> ${data.address}</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">
              El mecánico está trabajando en tu motocicleta en este momento. Te notificaremos cuando el servicio esté completo.
            </p>
            <a href="${getBaseUrl()}/dashboard/client" style="${buttonStyles}">
              Ver estado en vivo
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email cuando servicio finaliza
 */
export function emailServiceCompleted(data: {
  clientName: string;
  mechanicName: string;
  serviceName: string;
  notes?: string;
  serviceRequestId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ ¡Servicio completado!</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.clientName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.mechanicName}</strong> ha finalizado el servicio de <strong>${data.serviceName}</strong>.
            </p>
            ${data.notes ? `
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Notas del mecánico:</strong></p>
                <p style="margin: 10px 0 0 0;">${data.notes}</p>
              </div>
            ` : ""}
            <p style="font-size: 16px; margin-bottom: 20px;">
              ¡Nos encantaría conocer tu opinión! Por favor, califica este servicio.
            </p>
            <a href="${getBaseUrl()}/dashboard/client" style="${buttonStyles}">
              Calificar servicio ⭐
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Gracias por usar MotoHelp 🏍️
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email cuando servicio es cancelado
 */
export function emailServiceCanceled(data: {
  userName: string;
  serviceName: string;
  canceledBy: "CLIENT" | "MECHANIC";
  reason?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">❌ Servicio cancelado</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.userName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Lamentamos informarte que el servicio de <strong>${data.serviceName}</strong> ha sido cancelado.
            </p>
            ${data.reason ? `
              <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Motivo:</strong></p>
                <p style="margin: 10px 0 0 0;">${data.reason}</p>
              </div>
            ` : ""}
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${data.canceledBy === "CLIENT" ? "Has cancelado este servicio." : "El mecánico ha cancelado este servicio."}
            </p>
            <a href="${getBaseUrl()}/dashboard/client" style="${buttonStyles}">
              Ver mis servicios
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email para mecánico sobre nueva solicitud disponible
 */
export function emailNewServiceAvailable(data: {
  mechanicName: string;
  serviceName: string;
  clientName: string;
  address: string;
  description: string;
  scheduledAt: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Nueva solicitud disponible</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.mechanicName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hay una nueva solicitud de servicio que coincide con tu especialidad.
            </p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${data.clientName}</p>
              <p style="margin: 5px 0;"><strong>Descripción:</strong> ${data.description}</p>
              <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${data.address}</p>
              <p style="margin: 5px 0;"><strong>Fecha programada:</strong> ${data.scheduledAt}</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">
              ¡Date prisa! Las solicitudes se asignan por orden de aceptación.
            </p>
            <a href="${getBaseUrl()}/dashboard/mechanic" style="${buttonStyles}">
              Ver y aceptar solicitud
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email para mecánico cuando recibe calificación
 */
export function emailReceivedRating(data: {
  mechanicName: string;
  clientName: string;
  rating: number;
  comment?: string;
  serviceName: string;
}) {
  const stars = "⭐".repeat(data.rating);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⭐ Nueva calificación recibida</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.mechanicName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${data.clientName}</strong> ha calificado tu servicio.
            </p>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 32px; margin: 0;">${stars}</p>
              <p style="font-size: 24px; margin: 10px 0;"><strong>${data.rating}/5</strong></p>
              <p style="margin: 5px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
            </div>
            ${data.comment ? `
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Comentario del cliente:</strong></p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${data.comment}"</p>
              </div>
            ` : ""}
            <a href="${getBaseUrl()}/dashboard/mechanic" style="${buttonStyles}">
              Ver mi perfil
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email para admin cuando nuevo mecánico se registra
 */
export function emailNewMechanicPending(data: {
  mechanicName: string;
  mechanicEmail: string;
  specialty: string;
  experienceYears: number;
  mechanicId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">👨‍🔧 Nuevo mecánico pendiente de verificación</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>Administrador</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Un nuevo mecánico se ha registrado en la plataforma y está esperando verificación.
            </p>
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nombre:</strong> ${data.mechanicName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${data.mechanicEmail}</p>
              <p style="margin: 5px 0;"><strong>Especialidad:</strong> ${data.specialty}</p>
              <p style="margin: 5px 0;"><strong>Años de experiencia:</strong> ${data.experienceYears}</p>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Por favor, revisa su perfil y verifica sus credenciales lo antes posible.
            </p>
            <a href="${getBaseUrl()}/dashboard/admin" style="${buttonStyles}">
              Ir al panel de admin
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email de bienvenida para nuevos usuarios
 */
export function emailWelcome(data: {
  userName: string;
  userRole: "CLIENT" | "MECHANIC";
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">👋 ¡Bienvenido a MotoHelp!</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.userName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Gracias por registrarte en MotoHelp, la plataforma que conecta motociclistas con mecánicos expertos.
            </p>
            ${data.userRole === "CLIENT" ? `
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #f97316;">Primeros pasos:</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 5px 0;">Completa tu perfil con los datos de tu motocicleta</li>
                  <li style="margin: 5px 0;">Explora los servicios disponibles</li>
                  <li style="margin: 5px 0;">Solicita tu primer servicio cuando lo necesites</li>
                </ol>
              </div>
            ` : `
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #f97316;">Primeros pasos:</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 5px 0;">Completa tu perfil profesional</li>
                  <li style="margin: 5px 0;">Sube tu documentación (licencias, certificados)</li>
                  <li style="margin: 5px 0;">Espera la verificación del administrador</li>
                  <li style="margin: 5px 0;">¡Empieza a recibir solicitudes de servicio!</li>
                </ol>
              </div>
            `}
            <a href="${getBaseUrl()}/dashboard/${data.userRole.toLowerCase()}" style="${buttonStyles}">
              Ir a mi dashboard
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;}

/**
 * Email para recuperación de contraseña
 */
export function emailPasswordReset(data: {
  userName: string;
  resetUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Recuperar Contraseña</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hola <strong>${data.userName}</strong>,
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Recibimos una solicitud para reestablecertu contraseña. Si no fuiste tú, puedes ignorar este email.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Para crear una nueva contraseña, haz clic en el siguiente botón:
            </p>
            <a href="${data.resetUrl}" style="${buttonStyles}">
              Reestablecercontraseña
            </a>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                ⏰ Este enlace expira en <strong>1 hora</strong>
              </p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; margin: 10px 0; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${data.resetUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Por tu seguridad, nunca compartiremos tu contraseña ni te la pediremos por email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
