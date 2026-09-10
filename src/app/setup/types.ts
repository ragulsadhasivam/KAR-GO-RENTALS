export interface FileValue {
  url: string;
  fileName: string;
  fileType: string;
}

export interface BusinessData {
  name: string;
  logo: FileValue | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

export interface AdminData {
  name: string;
  mobile: string;
  email: string;
  password: string;
  photo: FileValue | null;
}

export interface VehicleData {
  key: string;
  make: string;
  model: string;
  registrationNumber: string;
  variant: string;
  year: string;
  colour: string;
  fuelType: string;
  purchaseDate: string;
  purchasePrice: string;
  currentKm: string;
}

export interface VehicleDocData {
  rc: { number: string; registrationDate: string; file: FileValue | null };
  insurance: {
    company: string;
    policyNumber: string;
    startDate: string;
    expiryDate: string;
    premium: string;
    file: FileValue | null;
  };
  fc: { number: string; startDate: string; expiryDate: string; file: FileValue | null };
  other: { name: string; expiryDate: string; file: FileValue | null } | null;
}

export interface PricingData {
  dailyRate: string;
  extraHourRate: string;
  extraKmRate: string;
}

export interface SetupState {
  business: BusinessData;
  admins: [AdminData, AdminData];
  vehicles: VehicleData[];
  documents: Record<string, VehicleDocData>;
  pricing: Record<string, PricingData>;
}

export const emptyFile = null;

export function makeEmptyVehicle(key: string, make: string, model: string, colour = "White"): VehicleData {
  return {
    key,
    make,
    model,
    registrationNumber: "",
    variant: "",
    year: String(new Date().getFullYear()),
    colour,
    fuelType: "Petrol",
    purchaseDate: "",
    purchasePrice: "",
    currentKm: "0",
  };
}

export function makeEmptyDocs(): VehicleDocData {
  return {
    rc: { number: "", registrationDate: "", file: null },
    insurance: { company: "", policyNumber: "", startDate: "", expiryDate: "", premium: "", file: null },
    fc: { number: "", startDate: "", expiryDate: "", file: null },
    other: null,
  };
}

export function makeEmptyPricing(): PricingData {
  return { dailyRate: "", extraHourRate: "", extraKmRate: "" };
}
