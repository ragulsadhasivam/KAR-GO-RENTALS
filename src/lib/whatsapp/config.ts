/**
 * All Meta WhatsApp Cloud API credentials come from environment variables
 * only — never hard-code or log the access token. Config is read lazily
 * (not at module load) so the app can still build/run when WhatsApp isn't
 * configured yet; sending simply fails gracefully in that case.
 */
export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  graphApiVersion: string;
  templateName: string;
  templateLanguage: string;
}

export class WhatsAppConfigError extends Error {}

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new WhatsAppConfigError(
      "WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the environment."
    );
  }

  return {
    accessToken,
    phoneNumberId,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? "",
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0",
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation",
    // "en" (not "en_US") is what the approved booking_confirmation template
    // is actually registered under for this account — verified against a
    // real send; Meta returns (#132001) "Template name does not exist in
    // the translation" if the language code doesn't match exactly.
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  };
}
