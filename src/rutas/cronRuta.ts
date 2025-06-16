import { Router } from 'express';
import { Request, Response } from 'express';
import {ejecutarRevisiónIntervaloFijo} from '../cron/articuloCron'; // Importamos el cron para que se ejecute al iniciar el servidor

const router = Router();
// GET para activar el Cron de manera manual
router.get('/', async (req: Request, res: Response) => {
  try {
    await ejecutarRevisiónIntervaloFijo();
    res.status(200).json({ mensaje: 'Cron de intervalo fijo ejecutado manualmente con éxito.' });
  } catch (error: any) {
    console.error('❌ Error en ejecución manual del cron:', error);
    res.status(500).json({ mensaje: 'Error al ejecutar el cron manualmente.', error: error.message });
  }
});

export default router;