-- CreateTable
CREATE TABLE "PriceCatalog" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "region" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "methodology" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimation" (
    "id" TEXT NOT NULL,
    "calculatorId" TEXT NOT NULL,
    "calculatorSlug" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "breakdown" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "minAmount" DOUBLE PRECISION NOT NULL,
    "averageAmount" DOUBLE PRECISION NOT NULL,
    "maxAmount" DOUBLE PRECISION NOT NULL,
    "catalogId" TEXT,
    "catalogVersion" TEXT NOT NULL,
    "catalogSource" TEXT NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "recoveryTokenHash" TEXT,
    "recoveryTokenExpiresAt" TIMESTAMP(3),
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Price" ADD COLUMN "catalogId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "estimationId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "consentGiven" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "consentVersion" TEXT;
ALTER TABLE "Lead" ADD COLUMN "consentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PriceCatalog_version_key" ON "PriceCatalog"("version");
CREATE INDEX "Price_catalogId_idx" ON "Price"("catalogId");
CREATE INDEX "Estimation_calculatorId_createdAt_idx" ON "Estimation"("calculatorId", "createdAt");
CREATE INDEX "Estimation_catalogVersion_idx" ON "Estimation"("catalogVersion");
CREATE UNIQUE INDEX "Estimation_recoveryTokenHash_key" ON "Estimation"("recoveryTokenHash");
CREATE INDEX "Lead_estimationId_idx" ON "Lead"("estimationId");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "PriceCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Estimation" ADD CONSTRAINT "Estimation_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "PriceCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
