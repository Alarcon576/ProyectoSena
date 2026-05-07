-- CreateTable
CREATE TABLE "Historial_IA_Salud" (
    "id_historial" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_mascota" INTEGER,
    "consulta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_IA_Salud_pkey" PRIMARY KEY ("id_historial")
);

-- AddForeignKey
ALTER TABLE "Historial_IA_Salud" ADD CONSTRAINT "Historial_IA_Salud_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
