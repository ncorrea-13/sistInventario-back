import { Router, Request, Response } from 'express';
import { crearVenta, listarVentas, verDetalleVenta } from '../servicios/ventaServicio';

const router = Router();

// POST para registrar una nueva venta
router.post('/', async (req: Request, res: Response) => {
  try {
    // Respuesta exitosa
    const { montoTotalVenta, articulos } = req.body;
    const nuevaVenta = await crearVenta({
      montoTotalVenta,
      articulos,
    });

    res.status(201).json({
      mensaje: 'Venta registrada exitosamente',
      venta: nuevaVenta,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la venta', error });
  }
});

// Obtener todas las ventas desde la base de datos
router.get('/', async (req: Request, res: Response) => {
  try {
    const ventas = await listarVentas();
    res.status(200).json({ ventas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las ventas', error });
  }
});

// Obtener el detalle de una sola venta
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ventaId = Number(req.params.id);
    const ventas = await verDetalleVenta(ventaId);
    res.status(200).json({ ventas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la venta', error });
  }
});
export default router;
