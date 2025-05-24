import { Router } from 'express';
import { Request, Response } from 'express';
import { crearProveedor, obtenerTodosLosProveedores } from '../servicios/proveedorServicio';
const router = Router();

router.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hola desde el backend' });
});

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

export default router;

