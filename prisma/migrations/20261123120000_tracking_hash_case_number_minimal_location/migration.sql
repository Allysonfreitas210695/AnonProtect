-- Revisão de privacidade (2026-11-23)
--
-- 1) Código de protocolo tratado como credencial: o banco guarda apenas o
--    SHA-256 (hex) do código. Os registros existentes são convertidos aqui,
--    então os denunciantes continuam acessando com o mesmo código.
-- 2) Número do caso: identificador exibido no painel, sem relação com o código.
-- 3) Coleta mínima de localização: bairro, CEP e número deixam de existir.
--    ATENÇÃO: os valores atuais dessas colunas são descartados.

-- 1) tracking_code -> tracking_code_hash
ALTER TABLE "reports" ADD COLUMN "tracking_code_hash" TEXT;
UPDATE "reports" SET "tracking_code_hash" = encode(sha256(convert_to("tracking_code", 'UTF8')), 'hex');
ALTER TABLE "reports" ALTER COLUMN "tracking_code_hash" SET NOT NULL;
CREATE UNIQUE INDEX "reports_tracking_code_hash_key" ON "reports"("tracking_code_hash");

DROP INDEX IF EXISTS "reports_tracking_code_idx";
DROP INDEX IF EXISTS "reports_tracking_code_key";
ALTER TABLE "reports" DROP COLUMN "tracking_code";

-- 2) case_number, numerado pela ordem de criação
ALTER TABLE "reports" ADD COLUMN "case_number" SERIAL NOT NULL;
UPDATE "reports" AS r
SET "case_number" = s.rn
FROM (SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS rn FROM "reports") AS s
WHERE r."id" = s."id";
SELECT setval(
  pg_get_serial_sequence('"reports"', 'case_number'),
  COALESCE((SELECT MAX("case_number") FROM "reports"), 0) + 1,
  false
);
CREATE UNIQUE INDEX "reports_case_number_key" ON "reports"("case_number");

-- 3) localização mínima
-- IF EXISTS: a coluna "number" foi criada fora das migrations (prisma db push)
-- em alguns bancos e não existe em outros.
ALTER TABLE "reports" DROP COLUMN IF EXISTS "district",
DROP COLUMN IF EXISTS "postal_code",
DROP COLUMN IF EXISTS "number";
