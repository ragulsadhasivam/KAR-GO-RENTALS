import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;
const requiredStr = (label: string) => z.string().trim().min(1, `${label} is required`);

export const businessSchema = z.object({
  name: requiredStr("Business name"),
  logoUrl: z.string().optional().nullable(),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit phone number"),
  whatsapp: z.string().regex(phoneRegex, "Enter a valid 10-digit WhatsApp number"),
  email: z.string().email("Enter a valid email address"),
  address: requiredStr("Address"),
  city: requiredStr("City"),
  state: requiredStr("State"),
});
export type BusinessInput = z.infer<typeof businessSchema>;

export const adminSchema = z.object({
  name: requiredStr("Name"),
  mobile: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  photoUrl: z.string().optional().nullable(),
});
export type AdminInput = z.infer<typeof adminSchema>;

export const adminUpdateSchema = adminSchema.partial({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: requiredStr("Password"),
});

export const vehicleSchema = z.object({
  registrationNumber: requiredStr("Registration number"),
  make: requiredStr("Make"),
  model: requiredStr("Model"),
  variant: z.string().optional().nullable(),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  colour: requiredStr("Colour"),
  fuelType: requiredStr("Fuel type"),
  purchaseDate: z.coerce.date(),
  purchasePrice: z.coerce.number().min(0, "Enter a valid amount"),
  currentKm: z.coerce.number().int().min(0, "Enter a valid KM reading"),
  imageUrl: z.string().optional().nullable(),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const pricingSchema = z.object({
  vehicleId: requiredStr("Vehicle"),
  dailyRate: z.coerce.number().min(0, "Enter a valid daily rate"),
  extraHourRate: z.coerce.number().min(0, "Enter a valid extra hour rate"),
  extraKmRate: z.coerce.number().min(0, "Enter a valid extra KM rate"),
});
export type PricingInput = z.infer<typeof pricingSchema>;

export const vehicleDocumentSchema = z
  .object({
    vehicleId: requiredStr("Vehicle"),
    type: z.enum(["RC", "INSURANCE", "FC", "OTHER"]),
    documentName: z.string().optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    issuer: z.string().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    expiryDate: z.coerce.date().optional().nullable(),
    premium: z.coerce.number().optional().nullable(),
    fileUrl: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    fileType: z.string().optional().nullable(),
  })
  .refine((d) => d.type !== "OTHER" || !!d.documentName, {
    message: "Document name is required",
    path: ["documentName"],
  })
  .refine((d) => d.type === "RC" || !!d.expiryDate, {
    message: "Expiry date is required",
    path: ["expiryDate"],
  });

export const customerSchema = z.object({
  fullName: requiredStr("Full name"),
  mobile: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  drivingLicenceNumber: requiredStr("Driving licence number"),
  licenceExpiry: z.coerce.date(),
  idProofType: requiredStr("ID proof type"),
  idProofNumber: requiredStr("ID proof number"),
  address: requiredStr("Address"),
  emergencyContact: z.string().optional().nullable(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const bookingSchema = z
  .object({
    customerId: z.string().optional(),
    newCustomer: customerSchema.optional(),
    vehicleId: requiredStr("Vehicle"),
    pickupAt: z.coerce.date(),
    returnAt: z.coerce.date(),
    pickupLocation: requiredStr("Pickup location"),
    returnLocation: requiredStr("Return location"),
    currentKm: z.coerce.number().int().min(0, "Enter a valid KM reading").optional(),
    dailyRate: z.coerce.number().min(0),
    rentalDays: z.coerce.number().int().min(1),
    extraHourRate: z.coerce.number().min(0),
    extraHours: z.coerce.number().min(0).default(0),
    extraKmRate: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    totalAmount: z.coerce.number().min(0),
    amountPaid: z.coerce.number().min(0).default(0),
    paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]).optional(),
  })
  .refine((d) => d.returnAt > d.pickupAt, {
    message: "Return date/time must be after pickup date/time",
    path: ["returnAt"],
  })
  .refine((d) => !!d.customerId || !!d.newCustomer, {
    message: "Select an existing customer or add a new one",
    path: ["customerId"],
  });

export const paymentSchema = z.object({
  bookingId: requiredStr("Booking"),
  amount: z.coerce.number().positive("Enter a valid amount"),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]),
  date: z.coerce.date().optional(),
});

export const handoverSchema = z.object({
  bookingId: requiredStr("Booking"),
  startingKm: z.coerce.number().int().min(0),
  fuelLevel: z.enum(["EMPTY", "1/4", "1/2", "3/4", "FULL"]),
  exteriorCondition: requiredStr("Exterior condition"),
  interiorCondition: requiredStr("Interior condition"),
  existingDamageNotes: z.string().optional().nullable(),
  photos: z.array(z.string()).default([]),
  customerSignatureUrl: z.string().optional().nullable(),
  handoverAt: z.coerce.date().optional(),
});

export const vehicleReturnSchema = z.object({
  bookingId: requiredStr("Booking"),
  endingKm: z.coerce.number().int().min(0),
  fuelLevel: z.enum(["EMPTY", "1/4", "1/2", "3/4", "FULL"]),
  newDamageNotes: z.string().optional().nullable(),
  photos: z.array(z.string()).default([]),
  extraKm: z.coerce.number().min(0).default(0),
  extraHours: z.coerce.number().min(0).default(0),
  damageCharge: z.coerce.number().min(0).default(0),
  otherPenalty: z.coerce.number().min(0).default(0),
  customerSignatureUrl: z.string().optional().nullable(),
  returnAt: z.coerce.date().optional(),
});

export const expenseSchema = z
  .object({
    type: z.enum(["CAR", "BUSINESS"]),
    category: requiredStr("Category"),
    vehicleId: z.string().optional().nullable(),
    date: z.coerce.date(),
    amount: z.coerce.number().positive("Enter a valid amount"),
    vendor: z.string().optional().nullable(),
    paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]),
    billUrl: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    serviceCentre: z.string().optional().nullable(),
    billNumber: z.string().optional().nullable(),
    kmAtService: z.coerce.number().int().optional().nullable(),
    nextServiceDate: z.coerce.date().optional().nullable(),
    nextServiceKm: z.coerce.number().int().min(0).optional().nullable(),
  })
  .refine((d) => d.type !== "CAR" || !!d.vehicleId, {
    message: "Select a vehicle",
    path: ["vehicleId"],
  })
  .refine((d) => d.category !== "SERVICE_MAINTENANCE" || !!d.serviceCentre, {
    message: "Service centre is required",
    path: ["serviceCentre"],
  })
  .refine((d) => d.category !== "SERVICE_MAINTENANCE" || d.kmAtService != null, {
    message: "KM shown on bill is required",
    path: ["kmAtService"],
  })
  .refine((d) => d.nextServiceKm == null || d.kmAtService == null || d.nextServiceKm > d.kmAtService, {
    message: "Next service KM must be greater than the current bill KM",
    path: ["nextServiceKm"],
  });

export const damageIncidentSchema = z.object({
  vehicleId: requiredStr("Vehicle"),
  bookingId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  date: z.coerce.date(),
  description: requiredStr("Description"),
  photos: z.array(z.string()).default([]),
  estimatedRepairCost: z.coerce.number().min(0).optional().nullable(),
  actualRepairCost: z.coerce.number().min(0).optional().nullable(),
  customerCharge: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(["REPORTED", "UNDER_REPAIR", "COMPLETED"]).default("REPORTED"),
  notes: z.string().optional().nullable(),
});

export const partnerTransactionSchema = z.object({
  partnerId: requiredStr("Partner"),
  type: z.enum([
    "INITIAL_INVESTMENT",
    "ADDITIONAL_INVESTMENT",
    "BUSINESS_EXPENSE_PAID_PERSONALLY",
    "WITHDRAWAL",
  ]),
  amount: z.coerce.number().positive("Enter a valid amount"),
  date: z.coerce.date(),
  notes: z.string().optional().nullable(),
});
