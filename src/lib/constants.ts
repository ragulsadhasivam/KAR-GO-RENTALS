export const VEHICLE_STATUS = ["AVAILABLE", "BOOKED", "ACTIVE", "SERVICE"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUS)[number];

export const BOOKING_STATUS = ["BOOKED", "ACTIVE", "RETURNED"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const FUEL_LEVELS = ["EMPTY", "1/4", "1/2", "3/4", "FULL"] as const;
export type FuelLevel = (typeof FUEL_LEVELS)[number];

export const DOCUMENT_TYPES = ["RC", "INSURANCE", "FC", "OTHER"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_STATUS = ["VALID", "EXPIRING_SOON", "EXPIRED", "NO_EXPIRY"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUS)[number];

export const EXPENSE_TYPES = ["CAR", "BUSINESS"] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const CAR_EXPENSE_CATEGORIES = [
  { value: "FUEL", label: "Fuel", group: "Running" },
  { value: "FASTAG", label: "FASTag", group: "Running" },
  { value: "TOLL", label: "Toll", group: "Running" },
  { value: "PARKING", label: "Parking", group: "Running" },
  { value: "CLEANING", label: "Car Wash / Cleaning", group: "Running" },
  { value: "SERVICE_MAINTENANCE", label: "Service / Maintenance", group: "Maintenance" },
  { value: "OTHER_CAR", label: "Other Car Expense", group: "Other" },
] as const;

export const BUSINESS_EXPENSE_CATEGORIES = [
  { value: "INSURANCE", label: "Insurance", group: "Business" },
  { value: "FC", label: "FC", group: "Business" },
  { value: "OTHER_BUSINESS", label: "Other", group: "Business" },
] as const;

export const ALL_EXPENSE_CATEGORIES = [
  ...CAR_EXPENSE_CATEGORIES,
  ...BUSINESS_EXPENSE_CATEGORIES,
];

export const DAMAGE_STATUS = ["REPORTED", "UNDER_REPAIR", "COMPLETED"] as const;
export type DamageStatus = (typeof DAMAGE_STATUS)[number];

export const PARTNER_TXN_TYPES = [
  { value: "INITIAL_INVESTMENT", label: "Initial Investment" },
  { value: "ADDITIONAL_INVESTMENT", label: "Additional Investment" },
  { value: "BUSINESS_EXPENSE_PAID_PERSONALLY", label: "Business Expense Paid Personally" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
] as const;

export const ID_PROOF_TYPES = ["Aadhaar", "PAN", "Voter ID", "Passport"] as const;

export const TN_CITIES = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
  "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet",
] as const;

export function categoryLabel(value: string) {
  return ALL_EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function paymentMethodLabel(value: string) {
  const map: Record<string, string> = {
    CASH: "Cash",
    UPI: "UPI",
    BANK_TRANSFER: "Bank Transfer",
    CARD: "Card",
    OTHER: "Other",
  };
  return map[value] ?? value;
}
