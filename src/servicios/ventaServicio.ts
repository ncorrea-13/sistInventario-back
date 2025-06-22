import { prisma } from '../prismaClient';
import { generarOrdenCompra } from './ordenCompraServicio';

export const crearVenta = async (data: {
  montoTotalVenta: number;
  articulos: [{ articuloId: number; cantidad: number }];
}) => {
  return prisma.$transaction(async (tx) => {
    let montoTotalCalculado = 0;

    for (const item of data.articulos) {
      const articulo = await tx.articulo.findUnique({
        where: { codArticulo: item.articuloId },
        select: {
          stockActual: true,
          costoCompra: true,
        },
      });

      if (!articulo) {
        throw new Error(`Artículo con ID ${item.articuloId} no encontrado.`);
      }

      if (item.cantidad > articulo.stockActual) {
        throw new Error(
          `No hay suficiente stock para el artículo con ID ${item.articuloId}. Stock actual: ${articulo.stockActual}, cantidad solicitada: ${item.cantidad}`
        );
      }

      const precioVentaUnitario = (articulo.costoCompra ?? 0) * 1.1;
      montoTotalCalculado += item.cantidad * precioVentaUnitario;
    }

    const venta = await tx.venta.create({
      data: {
        fechaVenta: new Date(),
        montoTotalVenta: Math.round(montoTotalCalculado * 100) / 100,
      },
    });

    for (const item of data.articulos) {
      const articuloActualizado = await tx.articulo.update({
        where: { codArticulo: item.articuloId },
        data: {
          stockActual: {
            decrement: item.cantidad,
          },
        },
        include: {
          modeloFijoLote: true,
        },
      });

      await tx.articuloVenta.create({
        data: {
          VentaId: venta.nroVenta,
          ArticuloId: item.articuloId,
          cantidadArticulo: item.cantidad,
        },
      });
      
      if (
        articuloActualizado.modeloInventario === 'loteFijo' &&
        articuloActualizado.modeloFijoLote &&
        articuloActualizado.stockActual <=
          articuloActualizado.modeloFijoLote.puntoPedido
      ) {
        const tamanoLote =
          articuloActualizado.modeloFijoLote.puntoPedido -
          articuloActualizado.stockActual +
          articuloActualizado.modeloFijoLote.loteOptimo;
        await generarOrdenCompra(item.articuloId, tamanoLote);
      }
    }

    return venta;
  });
};


const crearArticuloVenta = async (nroVenta: number, articulo: { articuloId: number; cantidad: number; }) => {
  await prisma.articuloVenta.create({
    data: {
      VentaId: nroVenta,
      ArticuloId: articulo.articuloId,
      cantidadArticulo: articulo.cantidad,
    },
  });
};


export const listarVentas = async () => {
  const ventas = await prisma.venta.findMany({
    include: {
      detalles: {
        include: {
          articulo: {
            select: {
              nombreArticulo: true,
            },
          },
        },
      },
    },
  });
  return ventas;
}

export const verDetalleVenta = async (nroVenta: number) => {
  const venta = await prisma.venta.findUnique({
    where: { nroVenta },
    include: {
      detalles: {
        include: {
          articulo: {
            select: {
              nombreArticulo: true,
            },
          },
        },
      },
    },
  });
  return venta;
}
