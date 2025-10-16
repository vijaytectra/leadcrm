-- CreateTable
CREATE TABLE "StudentFormAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "admissionFormId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progressData" JSONB,
    "lastAccessedAt" DATETIME,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentFormAccess_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentFormAccess_admissionFormId_fkey" FOREIGN KEY ("admissionFormId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentFormAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormReminderLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessId" TEXT NOT NULL,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" DATETIME NOT NULL,
    "nextReminderAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormWidget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "embedCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "admissionFormId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormWidget_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FormWidget_admissionFormId_fkey" FOREIGN KEY ("admissionFormId") REFERENCES "Form" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FormWidget" ("createdAt", "embedCode", "formId", "id", "isActive", "name", "settings", "type", "updatedAt") SELECT "createdAt", "embedCode", "formId", "id", "isActive", "name", "settings", "type", "updatedAt" FROM "FormWidget";
DROP TABLE "FormWidget";
ALTER TABLE "new_FormWidget" RENAME TO "FormWidget";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StudentFormAccess_leadId_key" ON "StudentFormAccess"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFormAccess_accessToken_key" ON "StudentFormAccess"("accessToken");

-- CreateIndex
CREATE INDEX "StudentFormAccess_accessToken_idx" ON "StudentFormAccess"("accessToken");

-- CreateIndex
CREATE INDEX "StudentFormAccess_leadId_idx" ON "StudentFormAccess"("leadId");

-- CreateIndex
CREATE INDEX "StudentFormAccess_email_idx" ON "StudentFormAccess"("email");

-- CreateIndex
CREATE INDEX "StudentFormAccess_status_idx" ON "StudentFormAccess"("status");

-- CreateIndex
CREATE INDEX "StudentFormAccess_tenantId_idx" ON "StudentFormAccess"("tenantId");

-- CreateIndex
CREATE INDEX "FormReminderLog_accessId_idx" ON "FormReminderLog"("accessId");

-- CreateIndex
CREATE INDEX "FormReminderLog_nextReminderAt_idx" ON "FormReminderLog"("nextReminderAt");
