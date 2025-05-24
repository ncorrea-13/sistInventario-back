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
const articuloDto_1 = require("../dto/articuloDto");
const articuloServicio_1 = require("../servicios/articuloServicio");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get('/hello', (req, res) => {
    res.json({ message: 'Hola desde el backend' });
});
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articulos = yield prisma.articulo.findMany();
        // Transformar los datos al formato del DTO
        const articulosDTO = articulos.map(articuloDto_1.toArticuloDTO);
        res.status(200).json(articulosDTO);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los artículos' });
    }
}));
// POST para crear un nuevo articulo
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nuevoArticulo = yield articuloServicio_1.ArticuloServicio.crearArticulo(req.body);
        res.status(201).json(nuevoArticulo);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Error al crear el artículo' });
    }
}));
exports.default = router;
