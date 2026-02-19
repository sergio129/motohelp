/**
 * Servicio de notificaciones por email
 * Maneja el envío de emails para diferentes eventos de la aplicación
 */

import { sendEmail } from "@/lib/email";
import {
  emailServiceCreated,
  emailMechanicAccepted,
  emailMechanicOnWay,
  emailServiceInProgress,
  emailServiceCompleted,
  emailServiceCanceled,
  emailNewServiceAvailable,
  emailReceivedRating,
  emailNewMechanicPending,
  emailWelcome,
} from "@/lib/emailTemplates";
import { ServiceStatus } from "@prisma/client";

// Tipos para los datos de notificación
interface ServiceAcceptedData {
  clientEmail: string;
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
  mechanicPhone?: string;
  caseNumber?: string;
}

interface ServiceCreatedData {
  clientEmail: string;
  clientName: string;
  serviceName: string;
  address: string;
  scheduledAt: string;
  caseNumber: string;
}

interface ServiceOnWayData {
  clientEmail: string;
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
  estimatedTime?: string;
  caseNumber?: string;
}

interface ServiceInProgressData {
  clientEmail: string;
  clientName: string;
  mechanicName: string;
  serviceName: string;
  address: string;
  caseNumber?: string;
}

interface ServiceCompletedData {
  clientEmail: string;
  clientName: string;
  mechanicName: string;
  serviceName: string;
  notes?: string;
  serviceRequestId: string;
  caseNumber?: string;
}

interface ServiceCanceledData {
  recipientEmail: string;
  userName: string;
  serviceName: string;
  canceledBy: "CLIENT" | "MECHANIC";
  reason?: string;
  caseNumber?: string;
}

interface NewServiceAvailableData {
  mechanicEmail: string;
  mechanicName: string;
  serviceName: string;
  clientName: string;
  address: string;
  description: string;
  scheduledAt: string;
}

interface RatingReceivedData {
  mechanicEmail: string;
  mechanicName: string;
  clientName: string;
  rating: number;
  comment?: string;
  serviceName: string;
}

interface NewMechanicPendingData {
  adminEmail: string;
  mechanicName: string;
  mechanicEmail: string;
  specialty: string;
  experienceYears: number;
  mechanicId: string;
}

interface WelcomeData {
  userEmail: string;
  userName: string;
  userRole: "CLIENT" | "MECHANIC";
}

export class NotificationService {
  /**
   * Notifica al cliente que su solicitud fue creada
   */
  static async notifyServiceCreated(data: ServiceCreatedData): Promise<boolean> {
    try {
      const html = emailServiceCreated({
        clientName: data.clientName,
        caseNumber: data.caseNumber,
        serviceName: data.serviceName,
        address: data.address,
        scheduledAt: data.scheduledAt,
      });

      await sendEmail({
        to: data.clientEmail,
        subject: `🧾 Solicitud creada - Caso ${data.caseNumber}`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending service created email:", error);
      return false;
    }
  }

  /**
   * Notifica al cliente que su solicitud fue aceptada
   */
  static async notifyServiceAccepted(data: ServiceAcceptedData): Promise<boolean> {
    try {
      const html = emailMechanicAccepted({
        clientName: data.clientName,
        mechanicName: data.mechanicName,
        serviceName: data.serviceName,
        address: data.address,
        mechanicPhone: data.mechanicPhone,
        caseNumber: data.caseNumber,
      });

      await sendEmail({
        to: data.clientEmail,
        subject: `🎉 Tu solicitud de ${data.serviceName} fue aceptada`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending service accepted email:", error);
      return false;
    }
  }

  /**
   * Notifica al cliente que el mecánico está en camino
   */
  static async notifyMechanicOnWay(data: ServiceOnWayData): Promise<boolean> {
    try {
      const html = emailMechanicOnWay({
        clientName: data.clientName,
        mechanicName: data.mechanicName,
        serviceName: data.serviceName,
        address: data.address,
        estimatedTime: data.estimatedTime,
        caseNumber: data.caseNumber,
      });

      await sendEmail({
        to: data.clientEmail,
        subject: `🚗 ${data.mechanicName} está en camino`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending mechanic on way email:", error);
      return false;
    }
  }

  /**
   * Notifica al cliente que el mecánico ha iniciado el servicio
   */
  static async notifyServiceInProgress(data: ServiceInProgressData): Promise<boolean> {
    try {
      console.log("[NotificationService] Preparing EN_PROCESO email for:", data.clientEmail);
      const html = emailServiceInProgress({
        clientName: data.clientName,
        mechanicName: data.mechanicName,
        serviceName: data.serviceName,
        address: data.address,
        caseNumber: data.caseNumber,
      });

      console.log("[NotificationService] Sending EN_PROCESO email...");
      await sendEmail({
        to: data.clientEmail,
        subject: `🔧 ${data.mechanicName} ha iniciado el servicio`,
        html,
      });

      console.log("[NotificationService] EN_PROCESO email sent successfully");
      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending service in progress email:", error);
      return false;
    }
  }

  /**
   * Notifica al cliente que el servicio fue completado
   */
  static async notifyServiceCompleted(data: ServiceCompletedData): Promise<boolean> {
    try {
      const html = emailServiceCompleted({
        clientName: data.clientName,
        mechanicName: data.mechanicName,
        serviceName: data.serviceName,
        notes: data.notes,
        serviceRequestId: data.serviceRequestId,
        caseNumber: data.caseNumber,
      });

      await sendEmail({
        to: data.clientEmail,
        subject: `✅ Servicio de ${data.serviceName} completado`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending service completed email:", error);
      return false;
    }
  }

  /**
   * Notifica que un servicio fue cancelado
   */
  static async notifyServiceCanceled(data: ServiceCanceledData): Promise<boolean> {
    try {
      const html = emailServiceCanceled({
        userName: data.userName,
        serviceName: data.serviceName,
        canceledBy: data.canceledBy,
        reason: data.reason,
        caseNumber: data.caseNumber,
      });

      await sendEmail({
        to: data.recipientEmail,
        subject: `❌ Servicio de ${data.serviceName} cancelado`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending service canceled email:", error);
      return false;
    }
  }

  /**
   * Notifica a mecánicos sobre nueva solicitud disponible
   */
  static async notifyNewServiceAvailable(data: NewServiceAvailableData): Promise<boolean> {
    try {
      const html = emailNewServiceAvailable({
        mechanicName: data.mechanicName,
        serviceName: data.serviceName,
        clientName: data.clientName,
        address: data.address,
        description: data.description,
        scheduledAt: data.scheduledAt,
      });

      await sendEmail({
        to: data.mechanicEmail,
        subject: `🔔 Nueva solicitud de ${data.serviceName}`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending new service available email:", error);
      return false;
    }
  }

  /**
   * Notifica a mecánico que recibió una calificación
   */
  static async notifyRatingReceived(data: RatingReceivedData): Promise<boolean> {
    try {
      const html = emailReceivedRating({
        mechanicName: data.mechanicName,
        clientName: data.clientName,
        rating: data.rating,
        comment: data.comment,
        serviceName: data.serviceName,
      });

      await sendEmail({
        to: data.mechanicEmail,
        subject: `⭐ Nueva calificación: ${data.rating}/5`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending rating received email:", error);
      return false;
    }
  }

  /**
   * Notifica al admin sobre nuevo mecánico pendiente de verificación
   */
  static async notifyNewMechanicPending(data: NewMechanicPendingData): Promise<boolean> {
    try {
      const html = emailNewMechanicPending({
        mechanicName: data.mechanicName,
        mechanicEmail: data.mechanicEmail,
        specialty: data.specialty,
        experienceYears: data.experienceYears,
        mechanicId: data.mechanicId,
      });

      await sendEmail({
        to: data.adminEmail,
        subject: `👨‍🔧 Nuevo mecánico pendiente: ${data.mechanicName}`,
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending new mechanic pending email:", error);
      return false;
    }
  }

  /**
   * Envía email de bienvenida a nuevo usuario
   */
  static async sendWelcomeEmail(data: WelcomeData): Promise<boolean> {
    try {
      const html = emailWelcome({
        userName: data.userName,
        userRole: data.userRole,
      });

      await sendEmail({
        to: data.userEmail,
        subject: "👋 ¡Bienvenido a MotoHelp!",
        html,
      });

      return true;
    } catch (error) {
      console.error("[NotificationService] Error sending welcome email:", error);
      return false;
    }
  }

  /**
   * Envía notificaciones según cambio de estado de servicio
   */
  static async notifyStatusChange(
    newStatus: ServiceStatus,
    data: {
      clientEmail: string;
      clientName: string;
      mechanicName: string;
      serviceName: string;
      address: string;
      notes?: string;
      serviceRequestId: string;
      caseNumber?: string;
    }
  ): Promise<boolean> {
    console.log(`[NotificationService] notifyStatusChange called with status: ${newStatus}`);
    
    switch (newStatus) {
      case "ACEPTADO":
        console.log("[NotificationService] Routing to notifyServiceAccepted");
        return this.notifyServiceAccepted(data);
      
      case "EN_CAMINO":
        console.log("[NotificationService] Routing to notifyMechanicOnWay");
        return this.notifyMechanicOnWay(data);
      
      case "EN_PROCESO":
        console.log("[NotificationService] Routing to notifyServiceInProgress");
        return this.notifyServiceInProgress(data);
      
      case "FINALIZADO":
        console.log("[NotificationService] Routing to notifyServiceCompleted");
        return this.notifyServiceCompleted(data);
      
      case "CANCELADO":
        console.log("[NotificationService] Routing to notifyServiceCanceled");
        // Notificar al cliente sobre la cancelación
        return this.notifyServiceCanceled({
          recipientEmail: data.clientEmail,
          userName: data.clientName,
          serviceName: data.serviceName,
          canceledBy: "MECHANIC", // Por defecto asumimos que fue el mecánico
          reason: data.notes,
          caseNumber: data.caseNumber,
        });
      
      default:
        console.log(`[NotificationService] No notification handler for status: ${newStatus}`);
        // Para otros estados no enviamos email
        return false;
    }
  }
}
