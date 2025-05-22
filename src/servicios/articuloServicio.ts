import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ArticuloServicio {
  static async crearArticulo(data: {
    nombreArticulo: string;
    descripcionArticulo: string;
    stockActual: number;
    costoAlmacenamiento: number;
    costoCompra: number;
    costoPedido: number;
    costoMantenimiento: number;
    demandaAnual: number;
    deviaacionDemandaL: number;
    deviaacionDemantaT: number;
    nivelServicioDeseado: number;
  }) {
    return await prisma.articulo.create({ data });
  }

  static async darDeBajaArticulo(codArticulo: number) {
    return await prisma.articulo.update({
      where: { codArticulo },
      data: { fechaBaja: new Date() },
    });
  }
}

