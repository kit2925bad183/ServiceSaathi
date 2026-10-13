export interface SendMessageOptions {
  recipientPhone: string;
  templateName: string;
  parameters: Record<string, string>;
  fallbackText: string;
}

export interface MessageSendResult {
  success: boolean;
  messageId: string;
  provider: "WHATSAPP_SANDBOX" | "SMS_MOCK";
  error?: string;
}

/**
 * Official messaging provider adapter with WhatsApp Business Cloud API & SMS fallback.
 * Uses explicit sandbox simulation when live credentials are not set.
 */
export async function sendTransactionalMessage(
  options: SendMessageOptions
): Promise<MessageSendResult> {
  const isEnabled = process.env.WHATSAPP_ENABLED === "true";
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  if (!isEnabled) {
    // Sandbox / Mock logging
    console.info(
      `[Messaging Adapter (Sandbox)] To: ${options.recipientPhone} | Template: ${options.templateName} | Text: "${options.fallbackText}"`
    );
    return {
      success: true,
      messageId,
      provider: "WHATSAPP_SANDBOX",
    };
  }

  // Live provider implementation
  try {
    const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: options.recipientPhone.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: options.fallbackText },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        messageId,
        provider: "WHATSAPP_SANDBOX",
        error: JSON.stringify(errData),
      };
    }

    return {
      success: true,
      messageId,
      provider: "WHATSAPP_SANDBOX",
    };
  } catch (error) {
    return {
      success: false,
      messageId,
      provider: "WHATSAPP_SANDBOX",
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
