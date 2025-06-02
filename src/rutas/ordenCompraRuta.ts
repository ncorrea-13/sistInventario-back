import { Router, Request, Response } from 'express';
import { obtenerTodasLasOrdenesCompra, obtenerOrdenCompraPorId, generarOrdenCompra, actualizarOrdenCompra } from '../servicios/ordenCompraServicio';
// Simulación de base de datos en memoria
let ordenesCompra: any[] = [];
let idCounter = 1;
const router = Router();

// Obtener todas las órdenes de compra en estado enviada y pendiente
router.get('/', async (req, res) => {
  try {
    const ordenes = await obtenerTodasLasOrdenesCompra();
    res.status(200).json(ordenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las órdenes de compra' });
  }
});

// Obtener una orden de compra 
router.get('/:id', async (req: Request, res: Response) => {
  const orden = await obtenerOrdenCompraPorId(parseInt(req.params.id));
  if (!orden) {
    res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
  }
  res.json(orden);
});

// Crear una nueva orden de compra
router.post('/', async (req, res) => {
  const datos = { articuloId: req.body.articuloId, tamanoLote: req.body.tamanoLote, proveedorId: req.body.proveedorId };
  const nuevaOrden = await generarOrdenCompra(datos.articuloId, datos.tamanoLote, datos.proveedorId);
  ordenesCompra.push(nuevaOrden);
  res.status(201).json(nuevaOrden);
});

// Actualizar una orden de compra existente
router.put('/:id', async (req, res) => {
  try {
    const ordenCompraId = req.body.ordenCompraId;
    const datosActualizados = req.body.datosActualizados; // Accede al objeto anidado
    const datos = {
      tamanoLote: datosActualizados.tamanoLote,
      montoOrden: datosActualizados.montoOrden,
      proveedorId: datosActualizados.proveedorId,
      ordenEstadoId: datosActualizados.ordenEstadoId
    }; const ordenActualizada = await actualizarOrdenCompra(ordenCompraId, datos);
    res.json(ordenActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la orden de compra' });
  }
});

export default router;
