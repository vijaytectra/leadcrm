-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "paymentAmount" INTEGER,
    "allowMultipleSubmissions" BOOLEAN NOT NULL DEFAULT false,
    "maxSubmissions" INTEGER,
    "submissionDeadline" DATETIME,
    "settings" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Form_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("allowMultipleSubmissions", "createdAt", "description", "id", "isActive", "maxSubmissions", "paymentAmount", "requiresPayment", "settings", "submissionDeadline", "tenantId", "title", "updatedAt") SELECT "allowMultipleSubmissions", "createdAt", "description", "id", "isActive", "maxSubmissions", "paymentAmount", "requiresPayment", "settings", "submissionDeadline", "tenantId", "title", "updatedAt" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
