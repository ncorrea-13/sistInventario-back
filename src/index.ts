import express from 'express';
import cors from 'cors';
import helloRoutes from './rutas/helloRoutes';
import prisma from "src/prismaClient";

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Configurar CORS para permitir solicitudes desde http://192.168.100.5:3001
app.use(cors({ origin: ['http://192.168.100.5:3001', 'http://localhost:3001'] }));

//Transofmramos al index.ts como un "manejador de rutas", el cual solamente envía /api al que maeje (que sería hello)
app.use('/api', helloRoutes);

(async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();
