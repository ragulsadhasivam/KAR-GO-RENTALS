-- AlterTable
ALTER TABLE "ServiceRecord" ADD COLUMN "nextServiceDate" DATETIME;
ALTER TABLE "ServiceRecord" ADD COLUMN "nextServiceKm" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "pickupAt" DATETIME NOT NULL,
    "returnAt" DATETIME NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "returnLocation" TEXT NOT NULL,
    "currentKm" INTEGER,
    "dailyRate" REAL NOT NULL,
    "rentalDays" INTEGER NOT NULL,
    "extraHourRate" REAL NOT NULL,
    "extraHours" REAL NOT NULL DEFAULT 0,
    "extraKmRate" REAL NOT NULL,
    "extraKm" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("code", "createdAt", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "returnAt", "returnLocation", "status", "totalAmount", "updatedAt", "vehicleId") SELECT "code", "createdAt", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "returnAt", "returnLocation", "status", "totalAmount", "updatedAt", "vehicleId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
