import { Router } from 'express';
import { crearProveedor, asignarArticuloAProveedor, obtenerTodosLosProveedores, darDeBajaProveedor, buscarArticulosPorProveedor, eliminarAsociacionArticuloProveedor } from '../servicios/proveedorServicio';
const router = Router();

//GET /api/proveedores PARA OBTENER TODOS LOS PROVEEDORES
router.get('/', async (req, res) => {
  try {
    const proveedores = await obtenerTodosLosProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los proveedores' });
  }
});

// POST /api/proveedores PARA CREAR UN NUEVO PROVEEDOR
router.post('/', async (req, res) => {
  try {
    const nuevoProveedor = await crearProveedor(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
});


// PATCH /api/proveedores/:id PARA DAR DE BAJA
router.patch('/:id', async (req, res) => {
  try {
    const codProveedor = Number(req.params.id);
    const proveedorBaja = await darDeBajaProveedor(codProveedor);
    res.status(200).json(proveedorBaja);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'No se pudo dar de baja el proveedor' });
  }
});

// GET /api/proveedores/:id/articulos PARA OBTENER ARTICULOS DE UN PROVEEDOR
router.get('/:id', async (req, res) => {
  const proveedorId = Number(req.params.id);
  try {
    const articulos = await buscarArticulosPorProveedor(proveedorId);
    res.status(200).json(articulos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos del proveedor.' });
  }
});

// POST /api/proveedores/:id/articulos ASIGNAR ARTICULO A PROVEEDOR
router.post('/:id', async (req, res) => {
  try {
    const proveedorId = parseInt(req.params.id);
    const { articuloId, precioUnitaria, demoraEntrega, cargoPedido, predeterminado } = req.body;
    const nuevaAsociacion = await asignarArticuloAProveedor(proveedorId, articuloId, cargoPedido, demoraEntrega, precioUnitaria, predeterminado);
    res.status(200).json(nuevaAsociacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al asociar el artículo al proveedor.' });
  }
});

// DELETE /api/proveedores/:id/:articuloId ELIMINAR ASOCIACION ARTICULO PROVEEDOR
router.delete('/:id/:articuloId', async (req, res) => {
  try {
    const proveedorId = parseInt(req.params.id);
    const articuloId = parseInt(req.params.articuloId);
    eliminarAsociacionArticuloProveedor(proveedorId, articuloId);
    res.status(200).json({ message: 'Asociación eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la asociación.' });
  }
});

export default router;

