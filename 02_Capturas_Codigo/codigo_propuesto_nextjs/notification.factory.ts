/**
 * Factory de notificaciones — patrón Factory Method.
 * Centraliza la creación de canales (n8n, email, WhatsApp, sistema interno).
 */

export type NotificationChannel = "n8n" | "email" | "whatsapp" | "system";

/** Payload alineado con el webhook actual (orden LISTO, etc.). */
export interface NotificationPayload {
  evento: string;
  fecha: string;
  orden?: {
    id: number;
    folio?: string;
    estado: string;
    fecha_entrega?: string | null;
    descripcion?: string;
  };
  cliente?: { nombre?: string; email?: string; telefono?: string };
  vehiculo?: { marca?: string; modelo?: string; placa?: string };
  /** Destino explícito cuando el canal lo requiere (email, teléfono, userId). */
  to?: string;
  message?: string;
}

/** Producto abstracto: todos los canales implementan la misma interfaz. */
export interface NotificationService {
  send(payload: NotificationPayload): Promise<void>;
}

// --- Concrete products (implementaciones concretas) ---

export class N8nNotification implements NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL no está configurado");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`n8n respondió con status ${response.status}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class EmailNotification implements NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    const to = payload.to ?? payload.cliente?.email;
    if (!to) {
      throw new Error("EmailNotification requiere payload.to o cliente.email");
    }
    // Integración futura: nodemailer, SendGrid, Resend, etc.
    console.log(`[email] → ${to}`, this.formatMessage(payload));
  }

  private formatMessage(payload: NotificationPayload): string {
    return (
      payload.message ??
      `Evento ${payload.evento} — orden ${payload.orden?.folio ?? payload.orden?.id}`
    );
  }
}

export class WhatsAppNotification implements NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    const to = payload.to ?? payload.cliente?.telefono;
    if (!to) {
      throw new Error(
        "WhatsAppNotification requiere payload.to o cliente.telefono"
      );
    }
    // Integración futura: Twilio, Meta Cloud API, etc.
    console.log(`[whatsapp] → ${to}`, payload.message ?? payload.evento);
  }
}

export class SystemNotification implements NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    const userId = payload.to ?? "broadcast";
    // Integración futura: tabla notificaciones, WebSocket, SSE
    console.log(`[system] usuario ${userId}`, payload);
  }
}

// --- Factory Method: el cliente pide un tipo y recibe el producto correcto ---

const registry: Record<NotificationChannel, () => NotificationService> = {
  n8n: () => new N8nNotification(),
  email: () => new EmailNotification(),
  whatsapp: () => new WhatsAppNotification(),
  system: () => new SystemNotification(),
};

/**
 * Crea la implementación de notificación según el canal.
 * Equivalente al "creator" del patrón Factory Method.
 */
export function createNotification(
  channel: NotificationChannel
): NotificationService {
  const factory = registry[channel];
  if (!factory) {
    throw new Error(`Canal de notificación no soportado: ${channel}`);
  }
  return factory();
}

/**
 * Envía usando el canal definido en NOTIFICATION_CHANNEL (por defecto n8n).
 * Útil para migrar desde notifyN8N sin cambiar todos los call sites.
 */
export async function notify(
  payload: NotificationPayload,
  channel?: NotificationChannel
): Promise<void> {
  const resolved =
    channel ??
    (process.env.NOTIFICATION_CHANNEL as NotificationChannel | undefined) ??
    "n8n";

  const service = createNotification(resolved);
  await service.send(payload);
}
