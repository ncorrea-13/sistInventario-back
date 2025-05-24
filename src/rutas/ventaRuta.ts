import { Router, Request, Response } from 'express';
import prisma from 'src/prismaClient';

const router = Router();

// POST para registrar una nueva venta
router.post('/', async (req: Request, res: Response) => {
    try {
        // Aquí puedes extraer los datos de la venta del body
        const { clienteId, productos, total, fecha } = req.body;

        // Simulación de guardado (reemplaza con lógica real de base de datos)
        const nuevaVenta = {
            id: Date.now(),
            clienteId,
            productos,
            total,
            fecha: fecha || new Date(),
        };

        // Respuesta exitosa
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
        const ventas = await prisma.venta.findMany();
        res.status(200).json({ ventas });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las ventas', error });
    }
});

export default router;
