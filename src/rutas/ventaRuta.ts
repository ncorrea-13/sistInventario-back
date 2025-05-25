import { Router, Request, Response } from 'express';
import { crearVenta, listarVentas } from '../servicios/ventaServicio';

const router = Router();

// POST para registrar una nueva venta
router.post('/', async (req: Request, res: Response) => {
  try {
    // Respuesta exitosa
    const { fechaVenta, montoTotalVenta, articulos } = req.body;
    const nuevaVenta = await crearVenta({
      fechaVenta: new Date(fechaVenta),
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

export default router;
