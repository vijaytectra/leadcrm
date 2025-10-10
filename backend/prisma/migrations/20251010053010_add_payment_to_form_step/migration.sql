-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPayment" BOOLEAN NOT NULL DEFAULT false,
    "paymentAmount" INTEGER,
    "fields" JSONB NOT NULL,
    "conditions" JSONB,
    "settings" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormStep_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormStep" ("conditions", "createdAt", "description", "fields", "formId", "id", "isActive", "order", "settings", "title", "updatedAt") SELECT "conditions", "createdAt", "description", "fields", "formId", "id", "isActive", "order", "settings", "title", "updatedAt" FROM "FormStep";
DROP TABLE "FormStep";
ALTER TABLE "new_FormStep" RENAME TO "FormStep";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
