import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearArticulo = async (data: { nombreArticulo: string; descripcionArticulo: string; stockActual: number; costoAlmacenamiento: number; costoCompra: number; costoPedido: number; costoMantenimiento: number; demandaAnual: number; deviaacionDemandaL: number; deviaacionDemantaT: number; nivelServicioDeseado: number; }) => {
  return await prisma.articulo.create({ data });
};

export const darDeBajaArticulo = async (codArticulo: number) => {
  return await prisma.articulo.update({
    where: { codArticulo },
    data: { fechaBaja: new Date() },
  });
};

