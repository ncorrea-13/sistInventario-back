import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearProveedor = async (data: { nombreProv: string; }) => {
  return await prisma.proveedor.create({ data });
};

export const darDeBajaProveedor = async (codProveedor: number) => {
  return await prisma.proveedor.update({
    where: { codProveedor },
    data: { fechaBajaProveedor: new Date() },
  });
};
