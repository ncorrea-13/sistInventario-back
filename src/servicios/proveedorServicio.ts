import { Prisma, PrismaClient } from '@prisma/client';
//import { prisma } from '../prismaClient';
//hay que pasar a usar esto
const prisma = new PrismaClient();

export const obtenerTodosLosProveedores = async () => {
  return await prisma.proveedor.findMany({
    where: {
      fechaBajaProveedor: null,
    },
  });
};

export const crearProveedor = async (data: Prisma.ProveedorCreateInput) => {
  return await prisma.proveedor.create({ data });
}

export const darDeBajaProveedor = async (codProveedor: number) => {
  // Verificar si el proveedor tiene órdenes de compra en estado pendiente o enviada
  const ordenesPendientesOEnviadas = await prisma.ordenCompra.findMany({
    where: {
      proveedorId: codProveedor,
      ordenEstado: {
        nombreEstadoOrden: {
          in: ['pendiente', 'enviada'],
        },
      },
    },
  });

  if (ordenesPendientesOEnviadas.length > 0) {
    throw new Error('No se puede dar de baja al proveedor porque tiene órdenes de compra en estado pendiente o enviada.');
  }

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
