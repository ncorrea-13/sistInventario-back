import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { toProveedorDTO, ProveedorDTO } from '../dto/proveedorDto';
import { crearProveedor } from '../servicios/proveedorServicio';
const prisma = new PrismaClient();
const router = Router();

router.get('/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hola desde el backend' });
});

//GET para obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      where: { fechaBajaProveedor: null }, // Solo los activos
    });

    // Transformar los datos al formato del DTO
    const proveedoresDTO: ProveedorDTO[] = proveedores.map(toProveedorDTO);

    res.status(200).json(proveedoresDTO);
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

