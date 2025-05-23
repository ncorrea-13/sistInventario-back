import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ArticuloServicio {
  static async crearArticulo(data:Prisma.ArticuloCreateInput ) {
    return await prisma.articulo.create({ data });
  }

  static async darDeBajaArticulo(codArticulo: number) {
    return await prisma.articulo.update({
      where: { codArticulo },
      data: { fechaBaja: new Date() },
    });
  }
}

