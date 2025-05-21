import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearOrdenCompra = async (data: { tamanoLote: number; montoOrden: number; proveedorId: number; ordenEstadoId: number; }) => {
  return await prisma.ordenCompra.create({ data });
};
