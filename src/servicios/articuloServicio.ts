import { prisma } from '../prismaClient';
import { calcularModeloLoteFijo, calcularModeloIntervaloFijo } from './modeloServicio';


// ✅ Crear un artículo
export const crearArticulo = async (data: any) => {

  const articulo = await prisma.articulo.create({
    data: {
      ...data,
      codArticulo: undefined,
    },
    select: {
      codArticulo: true,
      modeloInventario: true,
      demandaAnual: true,
      costoPedido: true,
      costoAlmacenamiento: true,
      desviacionDemandaL: true,
      desviacionDemandaT: true,
      nivelServicioDeseado: true,
    },
  });

  const proveedor = await prisma.proveedorArticulo.findFirst({
    where: {
      articuloId: articulo.codArticulo,
      predeterminado: true
    }
  });

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
      });

      await prisma.modeloInvFijo.create({
        data: {
          intervaloTiempo,
          stockSeguridadInt: calculo.stockSeguridadInt,
          articuloId: articulo.codArticulo,
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
  provId: number
) => {
  const { codArticulo: _, proveedores, ...dataSinCodArticulo } = data;
  const articuloActualizado = await prisma.articulo.update({
    where: { codArticulo },
    data: dataSinCodArticulo,
  });

  await prisma.proveedorArticulo.updateMany({
    where: {
      articuloId: codArticulo,
      predeterminado: true,
    },
    data: { predeterminado: false }
  });

  await prisma.proveedorArticulo.updateMany({
    where: {
      proveedorId: provId,
      articuloId: codArticulo
    },
    data: { predeterminado: true }
  });

  const tiempoEntrega = await prisma.proveedorArticulo.findFirst({
    where: {
      proveedorId: provId,
      articuloId: codArticulo
    },
    select: { demoraEntrega: true },
  });

  if (articuloActualizado.modeloInventario === 'lote_fijo') {
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
  } else if (articuloActualizado.modeloInventario === 'intervalo_fijo') {
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
        },
      });
    }
  }

  return articuloActualizado;
};

export const obtenerTodosLosArticulos = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
    },
  });
};

export const buscarArticuloPorId = async (codArticulo: number) => {
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo },
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


