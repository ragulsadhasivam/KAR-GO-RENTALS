// Booking channels on the public website: phone call and WhatsApp.
export const BOOKING_PHONE = "+917373522144";
export const BOOKING_PHONE_DISPLAY = "+91 73735 22144";
export const BOOKING_TEL_HREF = `tel:${BOOKING_PHONE}`;

// wa.me wants the number as digits only.
const WHATSAPP_NUMBER = BOOKING_PHONE.replace(/\D/g, "");

export function whatsappHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function whatsappCarHref(carName: string) {
  return whatsappHref(`Hi KAR GO RENTALS, I'd like to book the ${carName}. Is it available?`);
}

export const WHATSAPP_GENERAL_HREF = whatsappHref(
  "Hi KAR GO RENTALS, I'd like to book a self-drive car. Please share availability."
);

// Numbers shown in the footer's Contact column.
export const CONTACT_PHONES = [
  { tel: "+917373522144", display: "+91 73735 22144" },
  { tel: "+918825760529", display: "+91 88257 60529" },
];
