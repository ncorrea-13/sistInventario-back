import { prisma } from '../prismaClient';
import { generarOrdenCompra } from './ordenCompraServicio';

export const crearVenta = async (data: { fechaVenta: Date; montoTotalVenta: number; articulos: { articuloId: number; cantidad: number; }[]; }) => {
  return await prisma.$transaction(async (prisma) => {

    const venta = await prisma.venta.create({
      data: {
        nroVenta: Date.now(),
        fechaVenta: data.fechaVenta,
        montoTotalVenta: data.montoTotalVenta,
      },
    });

    for (const articulo of data.articulos) {
      await crearArticuloVenta(venta.nroVenta, articulo);
      await generarOrdenCompra(articulo.articuloId);
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
  const ventas = await prisma.venta.findMany();
  return ventas;
}
