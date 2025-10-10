-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "telecallerId" TEXT NOT NULL,
    "callType" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "duration" INTEGER,
    "outcome" TEXT,
    "notes" TEXT,
    "recordingUrl" TEXT,
    "recordingId" TEXT,
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CallLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CallLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CallLog_telecallerId_fkey" FOREIGN KEY ("telecallerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TelecallerPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "telecallerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "callsMade" INTEGER NOT NULL DEFAULT 0,
    "callsAnswered" INTEGER NOT NULL DEFAULT 0,
    "callsConverted" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "avgCallDuration" REAL NOT NULL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "responseRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TelecallerPerformance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TelecallerPerformance_telecallerId_fkey" FOREIGN KEY ("telecallerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "telecallerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUpReminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_telecallerId_fkey" FOREIGN KEY ("telecallerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CallLog_tenantId_idx" ON "CallLog"("tenantId");

-- CreateIndex
CREATE INDEX "CallLog_leadId_idx" ON "CallLog"("leadId");

-- CreateIndex
CREATE INDEX "CallLog_telecallerId_idx" ON "CallLog"("telecallerId");

-- CreateIndex
CREATE INDEX "CallLog_status_idx" ON "CallLog"("status");

-- CreateIndex
CREATE INDEX "CallLog_createdAt_idx" ON "CallLog"("createdAt");

-- CreateIndex
CREATE INDEX "TelecallerPerformance_tenantId_idx" ON "TelecallerPerformance"("tenantId");

-- CreateIndex
CREATE INDEX "TelecallerPerformance_telecallerId_idx" ON "TelecallerPerformance"("telecallerId");

-- CreateIndex
CREATE INDEX "TelecallerPerformance_date_idx" ON "TelecallerPerformance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TelecallerPerformance_tenantId_telecallerId_date_key" ON "TelecallerPerformance"("tenantId", "telecallerId", "date");

-- CreateIndex
CREATE INDEX "FollowUpReminder_tenantId_idx" ON "FollowUpReminder"("tenantId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_leadId_idx" ON "FollowUpReminder"("leadId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_telecallerId_idx" ON "FollowUpReminder"("telecallerId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_scheduledAt_idx" ON "FollowUpReminder"("scheduledAt");

-- CreateIndex
CREATE INDEX "FollowUpReminder_status_idx" ON "FollowUpReminder"("status");
