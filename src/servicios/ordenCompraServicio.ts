import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generarOrdenCompra = async (articuloId: number) => {
  const modeloLoteFijo = await prisma.modeloLoteFijo.findUnique({
    where: { articuloId },
  });

  if (modeloLoteFijo) {
    const articuloData = await prisma.articulo.findUnique({
      where: { codArticulo: articuloId },
    });

    if (
      articuloData &&
      articuloData.stockActual >= modeloLoteFijo.puntoPedido
    ) {
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

      const ultimaOrden = await prisma.ordenCompra.findFirst({
        orderBy: { numOrdenCompra: 'desc' },
      });

      const nuevoNumOrdenCompra = (ultimaOrden?.numOrdenCompra || 0) + 1;

      await prisma.ordenCompra.create({
        data: {
          numOrdenCompra: nuevoNumOrdenCompra,
          tamanoLote: modeloLoteFijo.loteOptimo,
          montoOrden: articuloData.costoCompra,
          proveedorId: proveedorPredeterminado.proveedorId,
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
    }
  }
};

