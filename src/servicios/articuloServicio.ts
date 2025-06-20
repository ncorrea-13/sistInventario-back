import { prisma } from '../prismaClient';
import { calcularModeloLoteFijo, calcularModeloIntervaloFijo } from './modeloServicio';


// ✅ Crear un artículo
export const crearArticulo = async (data: any) => {

  const articulo = await prisma.articulo.create({
    data: {
      ...data,
      codArticulo: undefined,
    },
  });

  const proveedor = await prisma.proveedorArticulo.findFirst({
    where: {
      articuloId: articulo.codArticulo,
      predeterminado: true
    }
  });
  console.log(articulo.modeloInventario);
  if (articulo.modeloInventario === 'loteFijo') {
    if (
      articulo.demandaAnual &&
      articulo.costoPedido &&
      articulo.costoAlmacenamiento &&
      articulo.desviacionDemandaL &&
      articulo.nivelServicioDeseado
    ) {
      const calculo = calcularModeloLoteFijo({
        demandaAnual: articulo.demandaAnual,
        costoPedido: articulo.costoPedido,
        costoAlmacenamiento: articulo.costoAlmacenamiento,
        desviacionDemandaL: articulo.desviacionDemandaL,
        nivelServicioDeseado: articulo.nivelServicioDeseado,
        tiempoEntrega: proveedor?.demoraEntrega || 5,
      });

      await prisma.modeloLoteFijo.create({
        data: {
          loteOptimo: calculo.loteOptimo,
          puntoPedido: calculo.puntoPedido,
          stockSeguridadLot: calculo.stockSeguridadLot,
          articuloId: articulo.codArticulo,
        },
      });
    }
  } else if (articulo.modeloInventario === 'intervaloFijo') {
    if (
      articulo.demandaAnual &&
      articulo.desviacionDemandaT &&
      articulo.nivelServicioDeseado
    ) {
      const intervaloTiempo = 7;

      const calculo = calcularModeloIntervaloFijo({
        demandaAnual: articulo.demandaAnual,
        desviacionDemandaT: articulo.desviacionDemandaT,
        nivelServicioDeseado: articulo.nivelServicioDeseado,
        intervaloTiempo,
        tiempoEntrega: proveedor?.demoraEntrega || 5,
        stockActual: articulo.stockActual || 0,
      });

      await prisma.modeloInvFijo.create({
        data: {
          intervaloTiempo,
          stockSeguridadInt: calculo.stockSeguridadInt,
          articuloId: articulo.codArticulo,
          tiempoActual: intervaloTiempo, // Inicializar el tiempo actual al intervalo
        },
      });
    }
  }
  return articulo;
};

// Actualizar un artículo
export const actualizarArticulo = async (
  codArticulo: number,
  data: any,
) => {
  const { codArticulo: _, proveedores, ...dataSinCodArticulo } = data;
  const articuloActualizado = await prisma.articulo.update({
    where: { codArticulo },
    data: dataSinCodArticulo,
  });

  const tiempoEntrega = await prisma.proveedorArticulo.findFirst({
    where: {
      predeterminado: true,
      articuloId: codArticulo
    },
    select: { demoraEntrega: true },
  });

  if (articuloActualizado.modeloInventario === 'loteFijo') {
    if (
      articuloActualizado.demandaAnual &&
      articuloActualizado.costoPedido &&
      articuloActualizado.costoAlmacenamiento &&
      articuloActualizado.desviacionDemandaL &&
      articuloActualizado.nivelServicioDeseado
    ) {
      const calculo = calcularModeloLoteFijo({
        demandaAnual: articuloActualizado.demandaAnual,
        costoPedido: articuloActualizado.costoPedido,
        costoAlmacenamiento: articuloActualizado.costoAlmacenamiento,
        desviacionDemandaL: articuloActualizado.desviacionDemandaL,
        nivelServicioDeseado: articuloActualizado.nivelServicioDeseado,
        tiempoEntrega: tiempoEntrega?.demoraEntrega || 5,
      });

      await prisma.modeloLoteFijo.upsert({
        where: { articuloId: codArticulo },
        update: {
          loteOptimo: calculo.loteOptimo,
          puntoPedido: calculo.puntoPedido,
          stockSeguridadLot: calculo.stockSeguridadLot,
        },
        create: {
          ...calculo,
          articuloId: codArticulo,
        },
      });
    }
  } else if (articuloActualizado.modeloInventario === 'intervaloFijo') {
    if (
      articuloActualizado.demandaAnual &&
      articuloActualizado.desviacionDemandaT &&
      articuloActualizado.nivelServicioDeseado
    ) {
      const intervaloTiempo = 7;
      const calculo = calcularModeloIntervaloFijo({
        demandaAnual: articuloActualizado.demandaAnual,
        desviacionDemandaT: articuloActualizado.desviacionDemandaT,
        nivelServicioDeseado: articuloActualizado.nivelServicioDeseado,
        intervaloTiempo,
        tiempoEntrega: tiempoEntrega?.demoraEntrega || 5,
        stockActual: articuloActualizado.stockActual || 0,
      });

      await prisma.modeloInvFijo.upsert({
        where: { articuloId: codArticulo },
        update: {
          intervaloTiempo,
          stockSeguridadInt: calculo.stockSeguridadInt,
        },
        create: {
          intervaloTiempo,
          stockSeguridadInt: calculo.stockSeguridadInt,
          articuloId: codArticulo,
          tiempoActual: intervaloTiempo, // Inicializar el tiempo actual al intervalo
        },
      });
    }
  }

  return articuloActualizado;
};

export const definirProvDeterminado = async (codArticulo: number, provId: number) => {

  await prisma.proveedorArticulo.updateMany({
    where: {
      articuloId: codArticulo,
      predeterminado: true,
    },
    data: { predeterminado: false }
  });

  const prov = await prisma.proveedorArticulo.updateMany({
    where: {
      proveedorId: provId,
      articuloId: codArticulo
    },
    data: { predeterminado: true }
  });

  return prov;
}

export const obtenerTodosLosArticulos = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
    },
    include: {
      proveedorArticulos: {
        include: {
          proveedor: true,
        },
      },
    },
  });
};

export const buscarArticuloPorId = async (codArticulo: number) => {
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo },
    include: {
      modeloFijoLote: true,
      modeloFijoInventario: true,
    },
  });

  if (!articulo) return null;

  const proveedores = await prisma.proveedorArticulo.findMany({
    where: { articuloId: codArticulo },
    select: {
      proveedor: {
        select: {
          codProveedor: true,
          nombreProv: true,
        },
      },
    },
  });

  return {
    ...articulo,
    proveedores: proveedores.map((p) => p.proveedor),
  };
};

export const darDeBajaArticulo = async (codArticulo: number) => {
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo },
    select: { stockActual: true },
  });

  if (articulo && articulo.stockActual > 0) {
    throw new Error(
      `El artículo con código ${codArticulo} no puede darse de baja porque tiene unidades en stock.`
    );
  }

  const ordenesPendientesOEnviadas = await prisma.ordenCompra.findMany({
    where: {
      detalles: {
        some: {
          articuloId: codArticulo,
        },
      },
      ordenEstado: {
        nombreEstadoOrden: {
          in: ['pendiente', 'enviada'],
        },
      },
    },
  });

  if (ordenesPendientesOEnviadas.length > 0) {
    throw new Error(
      `El artículo con código ${codArticulo} no puede darse de baja porque tiene órdenes de compra en estado pendiente o enviada.`
    );
  }

  return await prisma.articulo.update({
    where: { codArticulo },
    data: { fechaBaja: new Date() },
  });
};

export const validarStockArticulo = async (articuloId: number, puntoPedido: number): Promise<void> => {
  const articuloData = await prisma.articulo.findUnique({
    where: { codArticulo: articuloId },
  });

  if (!articuloData || articuloData.stockActual < puntoPedido) {
    throw new Error(
      `El stock actual del artículo con ID ${articuloId} no es suficiente para generar una Orden de Compra.`
    );
  }
};

//Listado de articulos a reponer

export const articulosAReponer = async () => {
  const articulosLoteFijo = await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
      modeloInventario: 'loteFijo',
    },
    include: {
      modeloFijoLote: true,
      proveedorArticulos: {
        include: {
          proveedor: true,
        },
      },
    },
  });

  // Filtrar artículos cuyo stockActual < puntoPedido y sin OC pendientes/enviadas
  const articulosLoteFijoFiltrados = await Promise.all(
    articulosLoteFijo.map(async (articulo: any) => {
      const demandaDiaria = articulo.demandaAnual ? articulo.demandaAnual / 365 : 0;
      const proveedorPredeterminado = articulo.proveedorArticulos.find(
        (pa: any) => pa.predeterminado
      );
      const tiempoEntrega = proveedorPredeterminado?.demoraEntrega || 5;
      const stockSeguridadLot = articulo.modeloFijoLote?.stockSeguridadLot || 0;
      const puntoPedido = demandaDiaria * tiempoEntrega + stockSeguridadLot;

      if (articulo.stockActual < puntoPedido) {
        const ordenes = await prisma.ordenCompra.findMany({
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
        if (ordenes.length === 0) {
          return articulo;
        }
      }
      return null;
    })
  );

  // Solo los que cumplen la condición
  const articulosAFiltrar = articulosLoteFijoFiltrados.filter(Boolean);

  return articulosAFiltrar;
};

//Listado de articulos faltantes
export const articuloStockSeguridad = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
      stockActual: 0,
    },
    include: {
      proveedorArticulos: {
        include: {
          proveedor: true,
        },
      },
      modeloFijoLote: true,
      modeloFijoInventario: true,
    },
  });
};

export const obtenerProveedorPredeterminado = async (articuloId: number): Promise<number> => {
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

  return proveedorPredeterminado.proveedorId;
};
//Funcion para solo ajustar las cantidades de un artículo
export const ajusteInventario = async (codArticulo: number, nuevoStock: number) => {
  if (nuevoStock < 0) {
    throw new Error('El nuevo stock no puede ser un número negativo.');
  }

  return await prisma.articulo.update({
    where: { codArticulo },
    data: { stockActual: nuevoStock },
    select: {
      codArticulo: true,
      stockActual: true,
    },
  });
};
