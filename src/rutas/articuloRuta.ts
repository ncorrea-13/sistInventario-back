import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { crearArticulo, obtenerTodosLosArticulos } from '../servicios/articuloServicio';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const articulos = await obtenerTodosLosArticulos();
    res.status(200).json(articulos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});

// POST para crear un nuevo articulo
router.post('/', async (req: Request, res: Response) => {
  try {
    const nuevoArticulo = await crearArticulo(req.body);
    res.status(201).json(nuevoArticulo);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear el artículo' });
  }
});

// PUT para modificar un artículo
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const codArticulo = Number(req.params.id);
    const articuloActualizado = await prisma.articulo.update({
      where: { codArticulo },
      data: req.body,
    });
    res.status(200).json(articuloActualizado);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al modificar el artículo' });
  }
});

export default router;
