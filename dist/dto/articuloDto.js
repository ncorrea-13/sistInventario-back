"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArticuloDTO = void 0;
// Función para transformar un Articulo en un DTO
const toArticuloDTO = (articulo) => ({
    id: articulo.codArticulo,
    nombre: articulo.nombreArticulo,
    descripcion: articulo.descripcionArticulo,
    stockActual: articulo.stockActual,
    costoCompra: articulo.costoCompra,
    nivelServicioDeseado: articulo.nivelServicioDeseado,
});
exports.toArticuloDTO = toArticuloDTO;
