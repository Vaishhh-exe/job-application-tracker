-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT 'blue',
ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
ADD COLUMN     "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "defaultPriority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "defaultStatus" TEXT NOT NULL DEFAULT 'applied',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';
