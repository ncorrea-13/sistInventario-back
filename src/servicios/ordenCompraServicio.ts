import { prisma } from '../prismaClient';
import { obtenerProveedorPredeterminado } from './articuloServicio';

//PRIMERO CRUD
export const generarOrdenCompra = async (
  articuloId: number,
  tamanoLote: number,
  proveedorId?: number
) => {

  await verificarOrdenCompraActiva(articuloId);
  const proveedorFinalId = proveedorId ?? (await obtenerProveedorPredeterminado(articuloId));
  await crearOrdenCompra(
    articuloId,
    tamanoLote,
    proveedorFinalId,
  );
};

const crearOrdenCompra = async (
  articuloId: number,
  tamanoLote: number,
  proveedorId: number,
): Promise<void> => {
  const proveedorArticulo = await prisma.proveedorArticulo.findFirst({
    where: { articuloId, proveedorId },
  });

  if (!proveedorArticulo) {
    throw new Error(`No se encontró un proveedor para el artículo con ID ${articuloId}`);
  }

  const montoOrden = tamanoLote * proveedorArticulo.precioUnitaria;

  await prisma.ordenCompra.create({
    data: {
      tamanoLote,
      montoOrden,
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

export const obtenerOrdenCompraPorId = async (ordenCompraId: number) => {
  const ordenCompra = await prisma.ordenCompra.findUnique({
    where: { numOrdenCompra: ordenCompraId },
    include: {
      ordenEstado: true, // Incluir información del estado de la orden
      detalles: {
        include: {
          articulo: true, // Incluir información del artículo si es necesario
        },
      },
    },
  });

  return ordenCompra;
};

export const actualizarOrdenCompra = async (ordenCompraId: number, datosActualizados: { tamanoLote?: number, montoOrden?: number, proveedorId?: number, ordenEstadoId?: number, }): Promise<object> => {
  const ordenExistente = await prisma.ordenCompra.findUnique({
    where: { numOrdenCompra: ordenCompraId },
  });

  if (!ordenExistente) {
    throw new Error(`No se encontró la Orden de Compra con ID ${ordenCompraId}.`);
  }

  if (
    datosActualizados.ordenEstadoId &&
    ordenExistente.ordenEstadoId !== datosActualizados.ordenEstadoId
  ) {
    const estadoOrden = await prisma.estadoOrden.findUnique({
      where: { codEstadoOrden: datosActualizados.ordenEstadoId },
    });

    if (!estadoOrden) {
      throw new Error(`El estado con ID ${datosActualizados.ordenEstadoId} no existe.`);
    }

    await cambiarEstadoOrdenCompra(
      ordenCompraId,
      estadoOrden.nombreEstadoOrden as "Enviada" | "Finalizada" | "Cancelada"
    );
  }

  if (datosActualizados.proveedorId) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { codProveedor: datosActualizados.proveedorId },
    });

    if (!proveedor) {
      throw new Error(`El proveedor con ID ${datosActualizados.proveedorId} no existe.`);
    }
  }

  // Actualizar la orden de compra con los datos proporcionados
  const ordenActualizada = await prisma.ordenCompra.update({
    where: { numOrdenCompra: ordenCompraId },
    data: {
      tamanoLote: datosActualizados.tamanoLote,
      montoOrden: datosActualizados.montoOrden,
      proveedorId: datosActualizados.proveedorId,
      ordenEstadoId: datosActualizados.ordenEstadoId
    },
  });
  return ordenActualizada;
};

export const obtenerTodasLasOrdenesCompra = async () => {
  return await prisma.ordenCompra.findMany({
    include: {
      ordenEstado: true, // Incluir información del estado de la orden
      detalles: {
        include: {
          articulo: true, // Incluir información del artículo si es necesario
        },
      },
    },
  });
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
  nuevoEstado: "Pendiente" | "Enviada" | "Finalizada" | "Cancelada"
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

  if (orden.ordenEstado.nombreEstadoOrden === "Enviada" && nuevoEstado === "Pendiente") {
    throw new Error("No se puede cambiar el estado de 'Enviada' a 'Pendiente'.");
  }

  if (orden.ordenEstado.nombreEstadoOrden === "Pendiente" && nuevoEstado !== "Cancelada" && nuevoEstado !== "Enviada") {
    throw new Error("Desde 'Pendiente', solo se puede cambiar a 'Cancelada' o 'Enviada'.");
  }

  if (orden.ordenEstado.nombreEstadoOrden !== "Pendiente" && nuevoEstado === "Cancelada") {
    throw new Error("Solo se puede cancelar una orden de compra cuando está pendiente");
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
