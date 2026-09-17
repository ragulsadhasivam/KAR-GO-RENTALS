/**
 * Normalizes a customer phone number to an E.164 WhatsApp destination
 * (with a leading "+"). The business is in India: a bare 10-digit Indian
 * mobile number gets "+91" prepended. A number that already carries a
 * country code (starts with "+", or already has more than 10 digits) is
 * left as-is — never double-prefixed. Returns null for anything that
 * doesn't look like a usable number.
 */
export function normalizeIndianWhatsAppNumber(rawMobile: string | null | undefined): string | null {
  if (!rawMobile) return null;
  const trimmed = rawMobile.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits.length >= 8 ? `+${digits}` : null;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return null;

  // Plain 10-digit Indian mobile number.
  if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
    return `+91${digitsOnly}`;
  }
  // Already carries the 91 country code (e.g. "919876543210").
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  // Any other number that already looks international (more than 10 digits).
  if (digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }

  return null;
}
