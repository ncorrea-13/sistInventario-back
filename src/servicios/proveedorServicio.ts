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

  static async asignarArticuloAProveedor(proveedorId: number, articuloId: number
    , cargoPedido: number, demoraEntrega: number, precioUnitaria: number, predeterminado: boolean = false
  ) {
    return await prisma.proveedorArticulo.create({
      data: {
      proveedorId,
      articuloId,
      cargoPedido,
      demoraEntrega,
      precioUnitaria,
      predeterminado,
      }
    });
  }
};
