import { Router } from 'express';
import { crearProveedor, obtenerTodosLosProveedores , darDeBajaProveedor} from '../servicios/proveedorServicio';
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

export default router;

