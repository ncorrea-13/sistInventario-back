import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';

// ✅ Crear un artículo
export const crearArticulo = async (data: Prisma.ArticuloCreateInput) => {
  return await prisma.articulo.create({ data });
};

// ✅ Obtener todos los artículos (sin baja lógica)
export const obtenerTodosLosArticulos = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
    },
  });
};

// ✅ Buscar un artículo por ID
export const buscarArticuloPorId = async (codArticulo: number) => {
  return await prisma.articulo.findUnique({
    where: { codArticulo },
  });
};

// ✅ Dar de baja un artículo si no tiene OC pendientes/enviadas
export const darDeBajaArticulo = async (codArticulo: number) => {
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
};

// ✅ Validar stock contra el punto de pedido
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

// ✅ Obtener proveedor predeterminado de un artículo
export const obtenerProveedorPredeterminado = async (articuloId: number): Promise<number> => {
  const proveedorPredeterminado = await prisma.proveedorArticulo.findFirst({
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
