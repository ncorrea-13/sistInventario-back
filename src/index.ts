import express from 'express';
import cors from 'cors';
import articuloRuta from './rutas/articuloRuta';
import proveedorRuta from './rutas/proveedorRuta';
import ordenCompraRuta from './rutas/ordenCompraRuta';
import ventaRuta from './rutas/ventaRuta';
import prisma from "./prismaClient";

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Configurar CORS para permitir solicitudes desde http://192.168.100.5:3001
app.use(cors({ origin: ['http://192.168.100.5:3001', 'http://localhost:3001'] }));

//Transofmramos al index.ts como un "manejador de rutas", el cual solamente envía /api al que maeje (que sería hello)
app.use('/api/articulo', articuloRuta);
app.use('/api/proveedor', proveedorRuta);
app.use('/api/ordenCompra', ordenCompraRuta);
app.use('/api/venta', ventaRuta);

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
