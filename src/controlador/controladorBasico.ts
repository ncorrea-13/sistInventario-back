import { Request, Response } from 'express';

export const getHello = (req: Request, res: Response) => {
  res.json({ message: 'Hola desde el backend' });
};
