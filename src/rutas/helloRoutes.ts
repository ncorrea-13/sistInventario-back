import { Router } from 'express';
import { getHello } from '../controlador/controladorBasico';

const router = Router();

router.get('/hello', getHello);

export default router;

