-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "reports_tracking_code_idx" ON "reports"("tracking_code");

-- CreateIndex
CREATE INDEX "reports_city_idx" ON "reports"("city");
