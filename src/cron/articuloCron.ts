import cron from 'node-cron';
import { prisma } from '../prismaClient';

cron.schedule('0 2 * * *', async () => {
  try {
    console.log('⏰ Ejecutando revisión automática del modelo de intervalo fijo...');

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
      const { articulo, stockSeguridadInt } = modelo;

      if (articulo.stockActual <= stockSeguridadInt) {
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

        // Parámetros para la fórmula
        const d = articulo.demandaAnual / 365;
        const T = modelo.intervaloTiempo;
        const L = proveedorPredeterminado.demoraEntrega;
        const z = articulo.nivelServicioDeseado;
        const sigma = articulo.desviacionDemandaT;
        const I = articulo.stockActual;

        if (d && T && L && z && sigma !== undefined && I !== undefined) {
          const cantidadSugerida = Math.max(1, Math.round(d * (T + L) + z * sigma - I));

          await prisma.ordenCompra.create({
            data: {
              tamanoLote: cantidadSugerida,
              montoOrden: articulo.costoCompra * cantidadSugerida,
              proveedorId: proveedorPredeterminado.proveedorId,
              ordenEstadoId: 1, // Estado "pendiente"
              detalles: {
                create: [{
                  articuloId: articulo.codArticulo,
                }],
              },
            },
          });

          console.log(`✅ OC creada para artículo ${articulo.nombreArticulo}`);
        } else {
          console.warn(`⚠️ Faltan datos para calcular q del artículo ${articulo.codArticulo}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error al ejecutar el cron:', error);
  }
});