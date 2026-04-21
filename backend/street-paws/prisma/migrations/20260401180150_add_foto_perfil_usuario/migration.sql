-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "foto_perfil" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3);
