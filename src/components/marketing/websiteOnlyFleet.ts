import type { FleetVehicle } from "./FleetShowcase";

// Cars shown on the public website only. They are not in the admin app or its
// database, so they can't be booked there; enquiries go through Call/WhatsApp.
// Set imageUrl to a file under /public/vehicles once a photo is added.
export const WEBSITE_ONLY_FLEET: FleetVehicle[] = [
  { id: "web-innova-crysta", make: "Toyota", model: "Innova Crysta", variant: null, fuelType: "Diesel", imageUrl: null, dailyRate: 4500, extraHourRate: null, extraKmRate: null },
  { id: "web-victoris", make: "Maruti Suzuki", model: "Victoris", variant: null, fuelType: "Petrol", imageUrl: null, dailyRate: 3000, extraHourRate: null, extraKmRate: null },
  { id: "web-virtus", make: "Volkswagen", model: "Virtus", variant: null, fuelType: "Petrol", imageUrl: null, dailyRate: 3000, extraHourRate: null, extraKmRate: null },
  { id: "web-venue", make: "Hyundai", model: "Venue", variant: null, fuelType: "Diesel", imageUrl: null, dailyRate: 2800, extraHourRate: null, extraKmRate: null },
];
