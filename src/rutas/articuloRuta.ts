import { Router } from 'express';
import { Request, Response } from 'express';
import { crearArticulo, obtenerTodosLosArticulos, buscarArticuloPorId, actualizarArticulo, articuloStockSeguridad, articulosAReponer, ajusteInventario } from '../servicios/articuloServicio';
import { darDeBajaArticulo } from '../servicios/articuloServicio';
import { calcularCGI } from '../servicios/modeloServicio';
const router = Router();

//GET para buscar todos los artículos
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

// GET para obtener los artículos a reponer
router.get('/reponer', async (req: Request, res: Response) => {
  try {
    const articulos = await articulosAReponer();
    res.status(200).json(articulos);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al obtener los artículos a reponer' });
  }
});

//GET para obtener los articulos faltantes
router.get('/stockSeguridad', async (req: Request, res: Response) => {
  try {
    const resultado = await articuloStockSeguridad();
    res.status(200).json(resultado);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
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
    const provId = req.body.provId;
    const codArticulo = Number(req.params.id);
    const articulo = await actualizarArticulo(codArticulo, req.body, provId);
    res.status(200).json(articulo);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al modificar el artículo' });
  }
});
// PUT para ajustar el inventario de un artículo
router.put('/:id/inventario', async (req: Request, res: Response) => {
  try {
    const codArticulo = Number(req.params.id);
    const { nuevoStock } = req.body;
    const articuloActualizado = await ajusteInventario(codArticulo, Number(nuevoStock));
    res.status(200).json(articuloActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al ajustar el inventario del artículo.' });
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
