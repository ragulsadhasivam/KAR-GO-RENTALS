import { getWhatsAppConfig, WhatsAppConfigError } from "./config";
import type { BookingConfirmationVariables, WhatsAppSendResult } from "./types";

/**
 * Never include the access token (or any header) in a thrown/returned
 * value or console output — only sanitized, user-safe text.
 */
function sanitizeMetaError(metaError: any, httpStatus: number): string {
  const userMsg = metaError?.error_user_msg;
  if (typeof userMsg === "string" && userMsg.trim()) return userMsg.slice(0, 300);

  const message = metaError?.message;
  if (typeof message === "string" && message.trim()) return message.slice(0, 300);

  if (httpStatus === 401 || httpStatus === 403) {
    return "WhatsApp authentication failed. Check the configured access token.";
  }
  if (httpStatus === 429) {
    return "WhatsApp rate limit reached. Please try again shortly.";
  }
  if (httpStatus === 404) {
    return "WhatsApp template or phone number ID not found.";
  }
  return `WhatsApp request failed (HTTP ${httpStatus}).`;
}

/**
 * Low-level call to the Meta WhatsApp Cloud API's messages endpoint with an
 * approved template. `to` must already be a normalized E.164 number (with
 * leading "+"); Meta itself expects digits only, without the "+".
 */
async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParameters: { name: string; text: string }[]
): Promise<WhatsAppSendResult> {
  let config;
  try {
    config = getWhatsAppConfig();
  } catch (err) {
    if (err instanceof WhatsAppConfigError) {
      return { success: false, error: err.message };
    }
    throw err;
  }

  const url = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: bodyParameters.map((p) => ({ type: "text", parameter_name: p.name, text: p.text })),
        },
      ],
    },
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return { success: false, error: timedOut ? "WhatsApp request timed out." : "Network error while contacting WhatsApp." };
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // Non-JSON response body — fall through with json left null.
  }

  if (!response.ok) {
    return { success: false, error: sanitizeMetaError(json?.error, response.status), statusCode: response.status };
  }

  const messageId = json?.messages?.[0]?.id ?? null;
  return { success: true, messageId };
}

/** Sends the approved "booking_confirmation" template with the exact
 * named variables it expects — no rental duration, bill, or return info,
 * since none of that is known yet at booking creation time. */
export async function sendBookingConfirmationTemplate(
  to: string,
  variables: BookingConfirmationVariables
): Promise<WhatsAppSendResult> {
  const config = (() => {
    try {
      return getWhatsAppConfig();
    } catch {
      return null;
    }
  })();

  if (!config) {
    return { success: false, error: "WhatsApp is not configured. Set the WHATSAPP_* environment variables." };
  }

  return sendTemplateMessage(to, config.templateName, config.templateLanguage, [
    { name: "customer_name", text: variables.customer_name },
    { name: "booking_id", text: variables.booking_id },
    { name: "vehicle", text: variables.vehicle },
    { name: "pickup_datetime", text: variables.pickup_datetime },
  ]);
}
