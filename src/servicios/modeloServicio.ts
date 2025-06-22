import { prisma } from '../prismaClient';

//Calcular CGI
export const calcularCGI = async (articuloId: number) => {
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo: articuloId },
    include: {
      modeloFijoLote: true,
      modeloFijoInventario: true,
    },
  });

  if (!articulo) throw new Error('Artículo no encontrado');

  const {
    demandaAnual,
    costoAlmacenamiento,
    costoMantenimiento,
    costoPedido,
    costoCompra,
    modeloFijoLote,
    modeloFijoInventario,
    stockActual,
    desviacionDemandaT,
    nivelServicioDeseado,
  } = articulo;

  const D = demandaAnual;
  const Ch = costoAlmacenamiento + costoMantenimiento;
  const Co = costoPedido;
  const Cu = costoCompra;

  let Q: number | undefined;
  let modelo: string;

  if (
    modeloFijoLote?.loteOptimo &&
    D !== null && Ch !== null && Co !== null && Cu !== null
  ) {
    Q = modeloFijoLote.loteOptimo;
    modelo = 'loteFijo';
  } else if (
    modeloFijoInventario?.intervaloTiempo &&
    D !== null && Ch !== null && Co !== null && Cu !== null && stockActual !== null
  ) {
     const intervalo = calcularModeloIntervaloFijo({
      demandaAnual: D,
      desviacionDemandaT,
      nivelServicioDeseado,
      intervaloTiempo: modeloFijoInventario.intervaloTiempo,
      tiempoEntrega: 0, // Cambia si tienes este dato
      stockActual,
    });
    Q = intervalo.loteOptimo;
    modelo = 'intervaloFijo';
  } else {
    throw new Error('Faltan datos o modelo para calcular el CGI');
  }
  const CGI = (Q / 2) * Ch + (D / Q) * Co + D * Cu;

  return {
    articulo: articulo.nombreArticulo,
    modelo,
    CGI: Math.round(CGI * 100) / 100,
    detalle: {
      Q: Math.round(Q * 100) / 100,
      Ch,
      Co,
      D,
      Cu,
    },
  };
};

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
    tiempoEntrega ,
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
  stockActual: number;
}) {
  const {
    demandaAnual,
    desviacionDemandaT,
    nivelServicioDeseado,
    intervaloTiempo,
    tiempoEntrega,
    stockActual,
  } = params;

  const d = demandaAnual / 365;
  const T = intervaloTiempo;
  const L = tiempoEntrega;

  const stockSeguridadInt = nivelServicioDeseado * desviacionDemandaT * (T + L);
  const loteOptimo = d * (T + L) + stockSeguridadInt - stockActual;
  const inventarioMaximo = d * (T + L) + stockSeguridadInt;
  return {
    stockSeguridadInt: Math.round(stockSeguridadInt),
    loteOptimo: Math.round(loteOptimo),
    inventarioMaximo: Math.round(inventarioMaximo),
  };
}
