import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearProveedor = async (data: Prisma.ProveedorCreateInput) => {
  return await prisma.proveedor.create({ data });
}

export const darDeBajaProveedor = async (codProveedor: number) => {


  return await prisma.proveedor.update({
    where: { codProveedor },
    data: { fechaBajaProveedor: new Date() },
  });
};

export const asignarArticuloAProveedor = async (proveedorId: number, articuloId: number
  , cargoPedido: number, demoraEntrega: number, precioUnitaria: number, predeterminado: boolean = false
) => {
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
