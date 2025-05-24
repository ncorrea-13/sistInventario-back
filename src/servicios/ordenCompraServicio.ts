import { PrismaClient } from '@prisma/client';
import { validarStockArticulo, obtenerProveedorPredeterminado } from './articuloServicio';
const prisma = new PrismaClient();

export const generarOrdenCompra = async (
  articuloId: number,
  tamanoLote?: number,
  proveedorId?: number
) => {
  const modeloLoteFijo = await prisma.modeloLoteFijo.findUnique({
    where: { articuloId },
  });

  if (!modeloLoteFijo) {
    throw new Error(`No se encontró un modelo de lote fijo para el artículo con ID ${articuloId}`);
  }

  await validarStockArticulo(articuloId, modeloLoteFijo.puntoPedido);
  await verificarOrdenCompraActiva(articuloId);
  const proveedorFinalId = proveedorId ?? (await obtenerProveedorPredeterminado(articuloId));

  await crearOrdenCompra(
    articuloId,
    tamanoLote || modeloLoteFijo.loteOptimo,
    proveedorFinalId,
    modeloLoteFijo.loteOptimo
  );
};

const verificarOrdenCompraActiva = async (articuloId: number): Promise<void> => {
  const ordenesExistentes = await prisma.ordenCompra.findMany({
    where: {
      detalles: {
        some: { articuloId },
      },
      ordenEstado: {
        nombreEstadoOrden: { in: ["Pendiente", "Enviada"] },
      },
    },
  });

  if (ordenesExistentes.length > 0) {
    throw new Error(
      `Ya existe una Orden de Compra activa (Pendiente o Enviada) para el artículo con ID ${articuloId}`
    );
  }
};

const crearOrdenCompra = async (
  articuloId: number,
  tamanoLote: number,
  proveedorId: number,
  costoCompra: number
): Promise<void> => {
  await prisma.ordenCompra.create({
    data: {
      tamanoLote,
      montoOrden: costoCompra,
      proveedorId,
      ordenEstadoId: 1,
      detalles: {
        create: [
          {
            articuloId,
          },
        ],
      },
    },
  });
}; 
