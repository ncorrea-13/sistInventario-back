import { prisma } from '../prismaClient';

//PRIMERO CRUD
export const crearArticulo = async (data: Prisma.ArticuloCreateInput) => {
  return await prisma.articulo.create({ data });
}

export const obtenerTodosLosArticulos = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
    },
  });
};

export const darDeBajaArticulo = async (codArticulo: number) => {
  // Verificar si el artículo tiene órdenes de compra en estado pendiente o enviada
  const ordenesPendientesOEnviadas = await prisma.ordenCompra.findMany({
    where: {
      detalles: {
        some: {
          articuloId: codArticulo,
        },
      },
      ordenEstado: {
        nombreEstadoOrden: {
          in: ['pendiente', 'enviada'],
        },
      },
    },
  });

  if (ordenesPendientesOEnviadas.length > 0) {
    throw new Error(
      `El artículo con código ${codArticulo} no puede darse de baja porque tiene órdenes de compra en estado pendiente o enviada.`
    );
  }

  return await prisma.articulo.update({
    where: { codArticulo },
    data: { fechaBaja: new Date() },
  });
}

export const validarStockArticulo = async (articuloId: number, puntoPedido: number): Promise<void> => {
  const articuloData = await prisma.articulo.findUnique({
    where: { codArticulo: articuloId },
  });

  if (!articuloData || articuloData.stockActual < puntoPedido) {
    throw new Error(
      `El stock actual del artículo con ID ${articuloId} no es suficiente para generar una Orden de Compra.`
    );
  }
};

export const obtenerProveedorPredeterminado = async (articuloId: number): Promise<number> => {
  let proveedorPredeterminado = await prisma.proveedorArticulo.findFirst({
    where: {
      articuloId,
      predeterminado: true,
    },
  });

  if (!proveedorPredeterminado) {
    throw new Error(
      `No se encontró un proveedor predeterminado para el artículo con ID ${articuloId}`
    );
  }

  return proveedorPredeterminado.proveedorId;
};

