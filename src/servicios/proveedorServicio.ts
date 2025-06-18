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
  // 1. Verificar si es predeterminado de algún artículo
  const esPredeterminado = await prisma.proveedorArticulo.findFirst({
    where: {
      proveedorId: codProveedor,
      predeterminado: true,
    },
  });
  if (esPredeterminado) {
    throw new Error('No se puede dar de baja: el proveedor es predeterminado de al menos un artículo.');
  }

  // 2. Verificar si tiene OC pendientes o en curso
  const ordenesPendientesOEnCurso = await prisma.ordenCompra.findFirst({
    where: {
      proveedorId: codProveedor,
      ordenEstado: {
        nombreEstadoOrden: {
          in: ['Pendiente', 'Enviada'],
        },
      },
    },
  });
  if (ordenesPendientesOEnCurso) {
    throw new Error('No se puede dar de baja: el proveedor tiene órdenes de compra pendientes o en curso.');
  }

  // 3. Dar de baja (soft delete)
  return await prisma.proveedor.update({
    where: { codProveedor },
    data: { fechaBajaProveedor: new Date() },
  });
};

export const asignarArticuloAProveedor = async (
  proveedorId: number,
  articuloId: number,
  cargoPedido: number,
  demoraEntrega: number,
  precioUnitaria: number,
  predeterminado: boolean = false
) => {
  // Validar que no exista ya la asociación
  const existe = await prisma.proveedorArticulo.findFirst({
    where: {
      proveedorId,
      articuloId,
    },
  });
  if (existe) {
    throw new Error('Este artículo ya está asociado a este proveedor.');
  }

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

export const buscarArticulosPorProveedor = async (proveedorId: number) => {
  return await prisma.proveedorArticulo.findMany({
    where: {
      proveedorId,
      proveedor: {
        fechaBajaProveedor: null,
      },
    },
    include: { articulo: true },
  });
};

export const eliminarAsociacionArticuloProveedor = async (proveedorId: number, articuloId: number) => {
  await prisma.proveedorArticulo.deleteMany({
    where: {
      proveedorId,
      articuloId,
      proveedor: {
        fechaBajaProveedor: null,
      },
      articulo: {
        fechaBaja: null,
      }
    },
  });
};
