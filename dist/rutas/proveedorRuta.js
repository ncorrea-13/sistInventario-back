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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const proveedorDto_1 = require("../dto/proveedorDto");
const proveedorServicio_1 = require("../servicios/proveedorServicio");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get('/hello', (req, res) => {
    res.json({ message: 'Hola desde el backend' });
});
//GET para obtener todos los proveedores
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proveedores = yield prisma.proveedor.findMany({
            where: { fechaBajaProveedor: null }, // Solo los activos
        });
        // Transformar los datos al formato del DTO
        const proveedoresDTO = proveedores.map(proveedorDto_1.toProveedorDTO);
        res.status(200).json(proveedoresDTO);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
}));
// POST para crear un nuevo proveedor
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nuevoProveedor = yield proveedorServicio_1.ProveedorServicio.crearProveedor(req.body);
        res.status(201).json(nuevoProveedor);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el proveedor' });
    }
}));
exports.default = router;
