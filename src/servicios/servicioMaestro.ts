import prisma from "src/prismaClient";
import { Request, Response } from "express";

export const getMaestro = async (req: Request, res: Response) => {
  try {
    const articulo = await prisma.articulo.findMany();
    res.json(articulo);
  } catch (error) {
    console.error("Error fetching maestro:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
