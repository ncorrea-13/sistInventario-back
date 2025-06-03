import { Router } from 'express';
import { crearProveedor, obtenerTodosLosProveedores, darDeBajaProveedor } from '../servicios/proveedorServicio';
import { prisma } from 'src/prismaClient';
const router = Router();

//GET para obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const proveedores = await obtenerTodosLosProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
});

// POST para crear un nuevo proveedor
router.post('/', async (req, res) => {
  try {
    const nuevoProveedor = await crearProveedor(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
});

// PATCH para dar de baja un proveedor
router.patch('/:id/baja', async (req, res) => {
  try {
    const codProveedor = Number(req.params.id);
    const proveedorBaja = await darDeBajaProveedor(codProveedor);
    res.status(200).json(proveedorBaja);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'No se pudo dar de baja el proveedor' });
  }
});

// POST /api/proveedores/:id/asociar-articulo
router.post('/api/proveedores/:id/asociar-articulo', async (req, res) => {
  const proveedorId = parseInt(req.params.id);
  const { articuloId, precioUnitaria, demoraEntrega, cargoPedido, predeterminado } = req.body;
  try {


    const nuevaAsociacion = await prisma.proveedorArticulo.create({
      data: {
        proveedorId,
        articuloId,
        precioUnitaria,
        demoraEntrega,
        cargoPedido,
        predeterminado,
      },
    });
    res.status(201).json(nuevaAsociacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al asociar el artículo al proveedor.' });
  }
});

// GET /api/proveedores/:id/articulos
router.get('/api/proveedores/:id/articulos', async (req, res) => {
  const proveedorId = parseInt(req.params.id);
  try {
    const articulos = await prisma.proveedorArticulo.findMany({
      where: { proveedorId },
      include: { articulo: true },
    });
    res.status(200).json(articulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos del proveedor.' });
  }
});

// DELETE /api/proveedores/:id/articulos/:articuloId
router.delete('/api/proveedores/:id/articulos/:articuloId', async (req, res) => {
  const proveedorId = parseInt(req.params.id);
  const articuloId = parseInt(req.params.articuloId);
  try {
    await prisma.proveedorArticulo.deleteMany({
      where: {
        proveedorId,
        articuloId,
      },
    });
    res.status(200).json({ message: 'Asociación eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la asociación.' });
  }
});

export default router;

