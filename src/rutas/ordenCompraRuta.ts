import { Router, Request, Response } from 'express';
import { OrdenDTO, toOrdenDTO } from '../dto/ordenDto';
// Simulación de base de datos en memoria
let ordenesCompra: any[] = [];
let idCounter = 1;
const router = Router();

// Obtener todas las órdenes de compra en estado enviada y pendiente
router.get('/', (req, res) => {
  try {
    // Filtrar órdenes de compra con estado "enviada" o "pendiente"
    const ordenesFiltradas = ordenesCompra.filter(orden =>
      orden.estado === 'enviada' || orden.estado === 'pendiente'
    );

    const OrdenDTO: OrdenDTO[] = ordenesFiltradas.map(toOrdenDTO);
    res.status(200).json(ordenesFiltradas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las órdenes de compra' });
  }

});

// Obtener una orden de compra 
router.get('/:id', (req: Request, res: Response) => {
  const orden = ordenesCompra.find(o => o.id === Number(req.params.id));
  if (!orden) {
    res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
  }
  res.json(orden);
});

// Crear una nueva orden de compra
router.post('/', (req, res) => {
  const nuevaOrden = {
    id: idCounter++,
    ...req.body,
    fechaCreacion: new Date()
  };
  ordenesCompra.push(nuevaOrden);
  res.status(201).json(nuevaOrden);
});
// Actualizar una orden de compra existente
router.put('/:id', (req, res) => {
  const index = ordenesCompra.findIndex(o => o.id === Number(req.params.id));
  if (index === -1) {
    res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
  }
  ordenesCompra[index] = { ...ordenesCompra[index], ...req.body };
  res.json(ordenesCompra[index]);
});



export default router;
