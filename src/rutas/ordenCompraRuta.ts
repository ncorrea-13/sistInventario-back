import { Router, Request, Response } from 'express';
import { obtenerTodasLasOrdenesCompra, obtenerOrdenCompraPorId, generarOrdenCompra, actualizarOrdenCompra } from '../servicios/ordenCompraServicio';
// Simulación de base de datos en memoria
let ordenesCompra: any[] = [];
let idCounter = 1;
const router = Router();

// Obtener todas las órdenes de compra en estado enviada y pendiente
router.get('/', (req, res) => {
  try {
    const ordenes = obtenerTodasLasOrdenesCompra();
    res.status(200).json(ordenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las órdenes de compra' });
  }
});

// Obtener una orden de compra 
router.get('/:id', (req: Request, res: Response) => {
  const orden = obtenerOrdenCompraPorId(parseInt(req.params.id));
  if (!orden) {
    res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
  }
  res.json(orden);
});

// Crear una nueva orden de compra
router.post('/', (req, res) => {
  const nuevaOrden = generarOrdenCompra(req.body);
  ordenesCompra.push(nuevaOrden);
  res.status(201).json(nuevaOrden);
});

// Actualizar una orden de compra existente
router.put('/:id', (req, res) => {
  try {
    const ordenActualizada = actualizarOrdenCompra(parseInt(req.params.id), req.body);
    res.json(ordenActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la orden de compra' });
  }
});

export default router;
