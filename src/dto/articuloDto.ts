import { Articulo } from '@prisma/client';

export interface ArticuloDTO {
  id: number;
  nombre: string;
  descripcion: string;
  stockActual: number;
  costoCompra: number;
  nivelServicioDeseado: number;
}

// Función para transformar un Articulo en un DTO
export const toArticuloDTO = (articulo: Articulo): ArticuloDTO => ({
  id: articulo.codArticulo,
  nombre: articulo.nombreArticulo,
  descripcion: articulo.descripcionArticulo,
  stockActual: articulo.stockActual,
  costoCompra: articulo.costoCompra,
  nivelServicioDeseado: articulo.nivelServicioDeseado,
});          
