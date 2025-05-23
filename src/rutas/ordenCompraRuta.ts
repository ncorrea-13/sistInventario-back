import  { Router, Request, Response } from 'express';



// Simulación de base de datos en memoria
let ordenesCompra: any[] = [];
let idCounter = 1;

const router = Router();

// Obtener todas las órdenes de compra
router.get('/hello', (req: Request, res: Response) => {
    res.json(ordenesCompra);
});

// Obtener una orden de compra 
router.get('/:id',  (req: Request,res: Response) => {
    const orden = ordenesCompra.find(o => o.id === Number(req.params.id));
    if (!orden) {
        return res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
    }
    res.json(orden);
});

// Crear una nueva orden de compra
router.post('/', (req: Request, res: Response) => {
    const nuevaOrden = {
        id: idCounter++,
        ...req.body,
        fechaCreacion: new Date()
    };
    ordenesCompra.push(nuevaOrden);
    res.status(201).json(nuevaOrden);
});

// Actualizar una orden de compra existente
router.put('/:id', (req: Request, res: Response) => {
    const index = ordenesCompra.findIndex(o => o.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
    }
    ordenesCompra[index] = { ...ordenesCompra[index], ...req.body };
    res.json(ordenesCompra[index]);
});



export default router;