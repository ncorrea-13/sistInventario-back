import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';

// ✅ Calcular modelo de lote fijo
export function calcularModeloLoteFijo(params: {
    demandaAnual: number;
    costoPedido: number;
    costoAlmacenamiento: number;
    tiempoEntrega: number;
    desviacionDemandaL: number;
    nivelServicioDeseado: number;
  }) {
    const {
      demandaAnual,
      costoPedido,
      costoAlmacenamiento,
      tiempoEntrega,
      desviacionDemandaL,
      nivelServicioDeseado,
    } = params;

    const demandaDiaria = demandaAnual / 365;

     const loteOptimo = Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento);
  const stockSeguridadLot = nivelServicioDeseado * desviacionDemandaL;
  const puntoPedido = demandaDiaria * tiempoEntrega + stockSeguridadLot;

   return {
    loteOptimo: Math.round(loteOptimo),
    puntoPedido: Math.round(puntoPedido),
    stockSeguridadLot: Math.round(stockSeguridadLot),
  };
};

// ✅ Calcular modelo de intervalo fijo
export function calcularModeloIntervaloFijo(params: {
  demandaAnual: number;
  desviacionDemandaT: number;
  nivelServicioDeseado: number;
  intervaloTiempo: number;
  tiempoEntrega: number;
}) {
  const {
    demandaAnual,
    desviacionDemandaT,
    nivelServicioDeseado,
    intervaloTiempo,
    tiempoEntrega,
  } = params;

  const d = demandaAnual / 365;
  const T = intervaloTiempo;
  const L = tiempoEntrega;

  const stockSeguridadInt = nivelServicioDeseado * desviacionDemandaT;
  const inventarioMaximo = d * (T + L) + stockSeguridadInt;

  return {
    stockSeguridadInt: Math.round(stockSeguridadInt),
    inventarioMaximo: Math.round(inventarioMaximo),
  };
}

// ✅ Crear un artículo
export const crearArticulo = async (data: Prisma.ArticuloCreateInput) => {
  
  const articulo = await prisma.articulo.create({data,
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
  if (articulo.modeloInventario === 'loteFijo') {
  if (
    articulo.demandaAnual &&
    articulo.costoPedido &&
    articulo.costoAlmacenamiento &&
    articulo.desviacionDemandaL &&
    articulo.nivelServicioDeseado
  ) {
    // ⚠️ Tiempo de entrega asumido fijo. Podés mejorarlo buscando el proveedor predeterminado.
    const tiempoEntrega = 5; // Por ejemplo

    const calculo = calcularModeloLoteFijo({
      demandaAnual: articulo.demandaAnual,
      costoPedido: articulo.costoPedido,
      costoAlmacenamiento: articulo.costoAlmacenamiento,
      desviacionDemandaL: articulo.desviacionDemandaL,
      nivelServicioDeseado: articulo.nivelServicioDeseado,
      tiempoEntrega,
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
      const tiempoEntrega = 5;

      const calculo = calcularModeloIntervaloFijo({
        demandaAnual: articulo.demandaAnual,
        desviacionDemandaT: articulo.desviacionDemandaT,
        nivelServicioDeseado: articulo.nivelServicioDeseado,
        intervaloTiempo,
        tiempoEntrega,
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
// ✅ Actualizar un artículo
export const actualizarArticulo = async (
  codArticulo: number,
  data: Prisma.ArticuloUpdateInput
) => {
  const articuloActualizado = await prisma.articulo.update({
    where: { codArticulo },
    data,
  });

 const tiempoEntrega = 5;

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
        tiempoEntrega,
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
        tiempoEntrega,
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

// ✅ Obtener todos los artículos (sin baja lógica)
export const obtenerTodosLosArticulos = async () => {
  return await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
    },
  });
};

// ✅ Buscar un artículo por ID
export const buscarArticuloPorId = async (codArticulo: number) => {
  return await prisma.articulo.findUnique({
    where: { codArticulo },
  });
};

// ✅ Dar de baja un artículo si no tiene OC pendientes/enviadas
export const darDeBajaArticulo = async (codArticulo: number) => {
  // Verificar si el artículo tiene órdenes de compra pendientes o enviadas
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

  // Verificar si el artículo tiene unidades en stock
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo },
    select: { stockActual: true },
  });

  if (articulo && articulo.stockActual > 0) {
    throw new Error(
      `El artículo con código ${codArticulo} no puede darse de baja porque tiene unidades en stock.`
    );
  }

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

// ✅ Validar stock contra el punto de pedido
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

// ✅ Obtener proveedor predeterminado de un artículo
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


