import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearVenta = async (data: { fechaVenta: Date; montoTotalVenta: number; articulos: { articuloId: number; cantidad: number; }[]; }) => {
  return await prisma.$transaction(async (prisma) => {
    // Crear la venta
    const venta = await prisma.venta.create({
      data: {
        nroVenta: Date.now(), // Generar un número único para nroVenta
        fechaVenta: data.fechaVenta,
        montoTotalVenta: data.montoTotalVenta,
      },
    });

    // Crear los ArticuloVenta relacionados
    for (const articulo of data.articulos) {
      await prisma.articuloVenta.create({
        data: {
          VentaId: venta.nroVenta, // Usar nroVenta como referencia
          ArticuloId: articulo.articuloId,
          cantidadArticulo: articulo.cantidad, // Corregir el nombre del campo
        },
      });

      // Verificar el modelo de inventario del artículo
      const modeloLoteFijo = await prisma.modeloLoteFijo.findUnique({
        where: { articuloId: articulo.articuloId },
      });

      if (modeloLoteFijo) {
        // Verificar si el stock actual es mayor o igual al Punto de Pedido (PP)
        const articuloData = await prisma.articulo.findUnique({
          where: { codArticulo: articulo.articuloId },
        });

        if (
          articuloData &&
          articuloData.stockActual >= modeloLoteFijo.puntoPedido
        ) {
          // Verificar si no hay órdenes pendientes o enviadas para el artículo
          const ordenesExistentes = await prisma.ordenCompra.findMany({
            where: {
              detalles: {
                some: { articuloId: articulo.articuloId },
              },
              ordenEstado: {
                nombreEstadoOrden: { in: ["Pendiente", "Enviada"] },
              }

            }
          });

          if (ordenesExistentes.length > 0) {
            throw new Error(`Ya existe una Orden de Compra activa (Pendiente o Enviada) para el artículo con ID ${articulo.articuloId}`);
          }

          // Generar una orden de compra en estado pendiente
          // Buscar el proveedor predeterminado para el artículo
          const proveedorPredeterminado = await prisma.proveedorArticulo.findFirst({
            where: {
              articuloId: articulo.articuloId,
              predeterminado: true,
            },
          });

          if (!proveedorPredeterminado) {
            throw new Error(`No se encontró un proveedor predeterminado para el artículo con ID ${articulo.articuloId}`);
          }

          // Obtener el último numOrdenCompra de la base de datos
          const ultimaOrden = await prisma.ordenCompra.findFirst({
            orderBy: { numOrdenCompra: 'desc' },
          });

          const nuevoNumOrdenCompra = (ultimaOrden?.numOrdenCompra || 0) + 1;

          await prisma.ordenCompra.create({
            data: {
              numOrdenCompra: nuevoNumOrdenCompra,
              tamanoLote: modeloLoteFijo.loteOptimo,
              montoOrden: articuloData.costoCompra, // Calcular el monto según el precio del artículo
              proveedorId: proveedorPredeterminado.proveedorId, // Usar el proveedor predeterminado
              ordenEstadoId: 1, // Estado "Pendiente"
              detalles: {
                create: [
                  {
                    articuloId: articulo.articuloId,
                  },
                ],
              },
            },
          });
        }
      }
    }

    return venta;
  });
};
