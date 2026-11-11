-- Preserva a trilha de auditoria: excluir uma denúncia não apaga mais os logs.
-- O sistema usa soft delete (reports.deleted_at), então a cascata não é necessária.
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_report_id_fkey";

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
