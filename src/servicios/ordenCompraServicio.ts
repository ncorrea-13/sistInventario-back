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
export const cambiarEstadoOrdenCompra = async (
  ordenCompraId: number,
  nuevoEstado: "Enviada" | "Finalizada" | "Cancelada"
): Promise<void> => {
  // Obtener la orden de compra actual junto con su estado
  const orden = await prisma.ordenCompra.findUnique({
    where: { numOrdenCompra: ordenCompraId },
    include: { ordenEstado: true },
  });

  if (!orden) {
    throw new Error(`No se encontró la Orden de Compra con ID ${ordenCompraId}.`);
  }

  if (orden.ordenEstado.nombreEstadoOrden === "Cancelada") {
    throw new Error("No se puede cambiar el estado de una Orden de Compra cancelada.");
  }

  const estado = await prisma.estadoOrden.findFirst({
    where: { nombreEstadoOrden: nuevoEstado },
  });

  if (!estado) {
    throw new Error(`El estado '${nuevoEstado}' no existe.`);
  }

  await prisma.ordenCompra.update({
    where: { numOrdenCompra: ordenCompraId },
    data: { ordenEstadoId: estado.codEstadoOrden },
  });
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
