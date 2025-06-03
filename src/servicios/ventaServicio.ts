import { prisma } from '../prismaClient';
import { generarOrdenCompra } from './ordenCompraServicio';

export const crearVenta = async (data: { montoTotalVenta: number; articulos: { articuloId: number; cantidad: number; }[]; }) => {

  const venta = await prisma.venta.create({
    data: {
      fechaVenta: new Date(),
      montoTotalVenta: data.montoTotalVenta,
    },
  });
  for (const articulo of data.articulos) {
    await crearArticuloVenta(venta.nroVenta, articulo);

    // Actualizar el stock del artículo
    await prisma.articulo.update({
      where: { codArticulo: articulo.articuloId },
      data: {
        stockActual: {
          decrement: articulo.cantidad,
        },
      },
    });
    const modeloLoteFijo = await prisma.modeloLoteFijo.findFirst({
      where: { articuloId: articulo.articuloId },
    });

    if (!modeloLoteFijo) {
      throw new Error(`No se encontró un modelo de lote fijo para el artículo con ID ${articulo.articuloId}`);
    }

    // Verificar el stock actual del artículo
    const articuloStock = await prisma.articulo.findUnique({
      where: { codArticulo: articulo.articuloId },
      select: { stockActual: true },
    });


    if (!articuloStock) {
      throw new Error(`No se encontró información de stock para el artículo con ID ${articulo.articuloId}`);
    }

    if (articuloStock.stockActual >= modeloLoteFijo.puntoPedido) {
      // Generar una orden de compra en estado pendiente
      await generarOrdenCompra(articulo.articuloId, modeloLoteFijo.puntoPedido);
    }
  }

  return venta;
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
  const ventas = await prisma.venta.findMany();
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
