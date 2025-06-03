import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { crearArticulo, obtenerTodosLosArticulos, buscarArticuloPorId } from '../servicios/articuloServicio';
import { darDeBajaArticulo } from '../servicios/articuloServicio';
import { calcularCGI } from '../servicios/articuloServicio';
const router = Router();

//GET ara buscar todos los artículos
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

// GET para ver la vista completa de un artículo
router.get('/:id', async (req, res) => {
  try {
    const codArticulo = Number(req.params.id);
    const articuloCompleto = await buscarArticuloPorId(codArticulo);
    res.status(200).json(articuloCompleto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});
// PUT para modificar un artículo
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const codArticulo = Number(req.params.id);
    const articulo = await prisma.articulo.update({
      where: { codArticulo },
      data: req.body,
    });
    res.status(200).json(articulo);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al modificar el artículo' });
  }
});

// PATCH para dar de baja un artículo
router.patch('/:id/baja', async (req: Request, res: Response) => {
  try {
    const codArticulo = Number(req.params.id);
    const articuloDadoDeBaja = await darDeBajaArticulo(codArticulo);
    res.status(200).json(articuloDadoDeBaja);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al dar de baja el artículo' });
  }
});

//  Calcular CGI de un artículo
router.get('/:id/cgi', async (req: Request, res: Response) => {
  try {
    const codArticulo = Number(req.params.id);
    const resultado = await calcularCGI(codArticulo);
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al calcular el CGI' });
  }
});
export default router;
