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
    "cancelledAt" DATETIME,
    "cancelledById" TEXT,
    "whatsappStatus" TEXT NOT NULL DEFAULT 'not_sent',
    "whatsappMessageId" TEXT,
    "whatsappError" TEXT,
    "whatsappSentAt" DATETIME,
    "whatsappLastAttemptAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "Admin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("code", "createdAt", "currentKm", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKm", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "status", "totalAmount", "updatedAt", "vehicleId", "whatsappError", "whatsappLastAttemptAt", "whatsappMessageId", "whatsappSentAt", "whatsappStatus") SELECT "code", "createdAt", "currentKm", "customerId", "dailyRate", "discount", "extraHourRate", "extraHours", "extraKm", "extraKmRate", "id", "pickupAt", "pickupLocation", "rentalDays", "status", "totalAmount", "updatedAt", "vehicleId", "whatsappError", "whatsappLastAttemptAt", "whatsappMessageId", "whatsappSentAt", "whatsappStatus" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

