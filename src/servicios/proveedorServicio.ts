import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProveedorServicio {
  static async crearProveedor(data: Prisma.ProveedorCreateInput) {
    return await prisma.proveedor.create({ data });
  }

  static async darDeBajaProveedor(codProveedor: number) {
    return await prisma.proveedor.update({
      where: { codProveedor },
      data: { fechaBajaProveedor: new Date() },
    });
  };
};
