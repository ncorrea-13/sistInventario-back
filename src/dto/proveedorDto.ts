import { Proveedor } from '@prisma/client';

export interface ProveedorDTO {
  id: number;
  nombre: string;
}

// Función para transformar un proveedor en un DTO
export const toProveedorDTO = (proveedor: Proveedor): ProveedorDTO => ({
  id: proveedor.codProveedor,
  nombre: proveedor.nombreProv,
});
