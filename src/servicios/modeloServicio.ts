import { prisma } from '../prismaClient';

//Calcular CGI
export const calcularCGI = async (articuloId: number) => {
  const articulo = await prisma.articulo.findUnique({
    where: { codArticulo: articuloId },
    include: {
      modeloFijoLote: true,
    },
  });

  if (!articulo) throw new Error('Artículo no encontrado');

  const {
    demandaAnual,
    costoAlmacenamiento,
    costoPedido,
    costoCompra,
    modeloFijoLote,
  } = articulo;

  if (
    demandaAnual === null ||
    costoAlmacenamiento === null ||
    costoPedido === null ||
    costoCompra === null ||
    !modeloFijoLote?.loteOptimo
  ) {
    throw new Error('Faltan datos para calcular el CGI');
  }

  const Q = modeloFijoLote.loteOptimo;
  const D = demandaAnual;
  const Ch = costoAlmacenamiento;
  const Co = costoPedido;
  const Cu = costoCompra;

  const CGI = (Q / 2) * Ch + (D / Q) * Co + D * Cu;

  return {
    articulo: articulo.nombreArticulo,
    CGI: Math.round(CGI * 100) / 100,
    detalle: {
      Q,
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
  const inventarioMaximo = d * (T + L) + stockSeguridadInt - stockActual ;

  return {
    stockSeguridadInt: Math.round(stockSeguridadInt),
    inventarioMaximo: Math.round(inventarioMaximo),
  };
}
