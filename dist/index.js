"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const articuloRuta_1 = __importDefault(require("./rutas/articuloRuta"));
const proveedorRuta_1 = __importDefault(require("./rutas/proveedorRuta"));
const ordenCompraRuta_1 = __importDefault(require("./rutas/ordenCompraRuta"));
const prismaClient_1 = __importDefault(require("./prismaClient"));
const app = (0, express_1.default)();
// Middleware to parse JSON requests
app.use(express_1.default.json());
// Configurar CORS para permitir solicitudes desde http://192.168.100.5:3001
app.use((0, cors_1.default)({ origin: ['http://192.168.100.5:3001', 'http://localhost:3001'] }));
//Transofmramos al index.ts como un "manejador de rutas", el cual solamente envía /api al que maeje (que sería hello)
app.use('/api/articulo', articuloRuta_1.default);
app.use('/api/proveedor', proveedorRuta_1.default);
app.use('/api/ordenCompra', ordenCompraRuta_1.default);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.$connect();
        console.log('Database connected successfully');
        // Start the server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }
}))();
