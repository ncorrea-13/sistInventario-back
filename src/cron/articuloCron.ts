import cron from 'node-cron';
import { prisma } from '../prismaClient';
import { calcularModeloIntervaloFijo } from '../servicios/modeloServicio';

export const ejecutarRevisiónIntervaloFijo = async () => {
  try {
    console.log('⏰ Ejecutando revisión del modelo de intervalo fijo...');

    const modelos = await prisma.modeloInvFijo.findMany({
      include: {
        articulo: {
          include: {
            proveedorArticulos: true,
          },
        },
      },
    });

    console.log(`📦 Se encontraron ${modelos.length} artículos con modelo de intervalo fijo.`);

    for (const modelo of modelos) {
      const { articulo } = modelo;
      const proveedorPredeterminado = articulo.proveedorArticulos.find(p => p.predeterminado);

      if (!proveedorPredeterminado) {
        console.warn(`❌ No se encontró proveedor predeterminado para el artículo ${articulo.codArticulo}`);
        continue;
      }

      const ocExistente = await prisma.ordenCompra.findFirst({
        where: {
          detalles: {
            some: {
              articuloId: articulo.codArticulo,
            },
          },
          ordenEstado: {
            nombreEstadoOrden: {
              in: ['pendiente', 'enviada'],
            },
          },
        },
      });

      if (ocExistente) {
        console.log(`🔁 Ya existe OC activa para artículo ${articulo.codArticulo}`);
        continue;
      }

      const intervaloTiempo = modelo.intervaloTiempo;
      const intervaloActual = modelo.tiempoActual;

      if (intervaloActual != 0) {
        console.warn(`Hoy no es día de revisión del artículo ${articulo.codArticulo}`);
        await prisma.modeloInvFijo.update({
          where: { id: modelo.id },
          data: { tiempoActual: intervaloActual - 1 },
        });
        continue;
      } else {
        await prisma.modeloInvFijo.update({
          where: { id: modelo.id },
          data: { tiempoActual: intervaloTiempo },
        });
      }

      const tiempoEntrega = proveedorPredeterminado.demoraEntrega;

      const calculo = calcularModeloIntervaloFijo({
        demandaAnual: articulo.demandaAnual,
        desviacionDemandaT: articulo.desviacionDemandaT,
        nivelServicioDeseado: articulo.nivelServicioDeseado,
        intervaloTiempo,
        tiempoEntrega,
        stockActual: articulo.stockActual,
      });

      const cantidadSugerida = Math.max(1, Math.round(calculo.inventarioMaximo - articulo.stockActual));

      await prisma.ordenCompra.create({
        data: {
          tamanoLote: cantidadSugerida,
          montoOrden: articulo.costoCompra * cantidadSugerida,
          proveedorId: proveedorPredeterminado.proveedorId,
          ordenEstadoId: 1,
          detalles: {
            create: [
              {
                articuloId: articulo.codArticulo,
              },
            ],
          },
        },
      });

      console.log(`✅ OC creada para artículo ${articulo.nombreArticulo}`);
    }
  } catch (error) {
    console.error('❌ Error al ejecutar el cron:', error);
  }
};

// ⏰ Este es el cron programado automáticamente (mantener para producción)
cron.schedule('0 2 * * *', ejecutarRevisiónIntervaloFijo);