import { OrdenCompra } from '@prisma/client';

export interface OrdenDTO {
  numOrdenCompra: number;
  tamanoLote: number;
  montoOrden: number;
  proveedorId: number;
  ordenEstadoId: number;
}

export const toOrdenDTO = (orden: OrdenCompra): OrdenDTO => ({
  numOrdenCompra: orden.numOrdenCompra,
  tamanoLote: orden.tamanoLote,
  montoOrden: orden.montoOrden,
  proveedorId: orden.proveedorId,
  ordenEstadoId: orden.ordenEstadoId,
});
