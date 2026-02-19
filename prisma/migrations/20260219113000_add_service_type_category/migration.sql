ALTER TABLE "ServiceType"
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OTROS';

UPDATE "ServiceType"
SET "category" = CASE
  WHEN "name" ILIKE '%aceite%' OR "name" ILIKE '%cadena%' OR "name" ILIKE '%revisión%' OR "name" ILIKE '%revision%' OR "name" ILIKE '%preventiv%'
    THEN 'MANTENIMIENTO_PREVENTIVO'
  WHEN "name" ILIKE '%llanta%' OR "name" ILIKE '%pinchad%' OR "name" ILIKE '%bater%' OR "name" ILIKE '%auxilio%' OR "name" ILIKE '%emergenc%'
    THEN 'EMERGENCIAS'
  WHEN "name" ILIKE '%freno%' OR "name" ILIKE '%repuesto%' OR "name" ILIKE '%repar%' OR "name" ILIKE '%instalaci%'
    THEN 'REPARACIONES'
  ELSE 'OTROS'
END;