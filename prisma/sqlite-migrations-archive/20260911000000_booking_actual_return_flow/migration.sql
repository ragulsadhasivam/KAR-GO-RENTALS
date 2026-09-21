-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "pickupAt" DATETIME NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "currentKm" INTEGER,
    "dailyRate" REAL NOT NULL,
    "rentalDays" INTEGER NOT NULL DEFAULT 0,
    "extraHourRate" REAL NOT NULL,
    "extraHours" REAL NOT NULL DEFAULT 0,
    "extraKmRate" REAL NOT NULL,
    "extraKm" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("code", "createdAt", "currentKm", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKm", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "status", "totalAmount", "updatedAt", "vehicleId") SELECT "code", "createdAt", "currentKm", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKm", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "status", "totalAmount", "updatedAt", "vehicleId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");
CREATE TABLE "new_VehicleReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "endingKm" INTEGER NOT NULL,
    "fuelLevel" TEXT NOT NULL,
    "newDamageNotes" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "extraKm" REAL NOT NULL DEFAULT 0,
    "extraHours" REAL NOT NULL DEFAULT 0,
    "damageCharge" REAL NOT NULL DEFAULT 0,
    "otherPenalty" REAL NOT NULL DEFAULT 0,
    "customerSignatureUrl" TEXT,
    "returnAt" DATETIME NOT NULL,
    "returnLocation" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleReturn_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VehicleReturn" ("bookingId", "createdAt", "customerSignatureUrl", "damageCharge", "endingKm", "extraHours", "extraKm", "fuelLevel", "id", "newDamageNotes", "otherPenalty", "photos", "returnAt") SELECT "bookingId", "createdAt", "customerSignatureUrl", "damageCharge", "endingKm", "extraHours", "extraKm", "fuelLevel", "id", "newDamageNotes", "otherPenalty", "photos", "returnAt" FROM "VehicleReturn";
DROP TABLE "VehicleReturn";
ALTER TABLE "new_VehicleReturn" RENAME TO "VehicleReturn";
CREATE UNIQUE INDEX "VehicleReturn_bookingId_key" ON "VehicleReturn"("bookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

