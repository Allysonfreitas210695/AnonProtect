-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'MESSAGE_SENT', 'NOTE_ADDED', 'EVIDENCE_ADDED');

-- AlterTable User.role: Convert String to UserRole enum
ALTER TABLE "User" 
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "UserRole" USING (role::"UserRole"),
  ALTER COLUMN "role" SET DEFAULT 'SUPERVISOR'::"UserRole";

-- AlterTable Report.status: Convert String to ReportStatus enum
ALTER TABLE "Report" 
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ReportStatus" USING (status::"ReportStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ReportStatus";

-- AlterTable Attachment.category: Convert String to AttachmentCategory enum
ALTER TABLE "Attachment" 
  ALTER COLUMN "category" DROP DEFAULT,
  ALTER COLUMN "category" TYPE "AttachmentCategory" USING (category::"AttachmentCategory"),
  ALTER COLUMN "category" SET DEFAULT 'OTHER'::"AttachmentCategory";

-- AlterTable Message.sender: Convert String to MessageSender enum
ALTER TABLE "Message" 
  ALTER COLUMN "sender" TYPE "MessageSender" USING (sender::"MessageSender");

-- AlterTable ActivityLog.action: Convert String to ActivityAction enum
ALTER TABLE "ActivityLog" 
  ALTER COLUMN "action" TYPE "ActivityAction" USING (action::"ActivityAction");
