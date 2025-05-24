"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProveedorDTO = void 0;
// Función para transformar un proveedor en un DTO
const toProveedorDTO = (proveedor) => ({
    id: proveedor.codProveedor,
    nombre: proveedor.nombreProv,
});
exports.toProveedorDTO = toProveedorDTO;
