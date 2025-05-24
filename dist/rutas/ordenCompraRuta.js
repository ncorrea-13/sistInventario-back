"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Simulación de base de datos en memoria
let ordenesCompra = [];
let idCounter = 1;
const router = (0, express_1.Router)();
// Obtener todas las órdenes de compra
router.get('/hello', (req, res) => {
    res.json(ordenesCompra);
});
// Obtener una orden de compra 
router.get('/:id', (req, res) => {
    const orden = ordenesCompra.find(o => o.id === Number(req.params.id));
    if (!orden) {
        return res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
    }
    res.json(orden);
});
// Crear una nueva orden de compra
router.post('/', (req, res) => {
    const nuevaOrden = Object.assign(Object.assign({ id: idCounter++ }, req.body), { fechaCreacion: new Date() });
    ordenesCompra.push(nuevaOrden);
    res.status(201).json(nuevaOrden);
});
// Actualizar una orden de compra existente
router.put('/:id', (req, res) => {
    const index = ordenesCompra.findIndex(o => o.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
    }
    ordenesCompra[index] = Object.assign(Object.assign({}, ordenesCompra[index]), req.body);
    res.json(ordenesCompra[index]);
});
// Eliminar una orden de compra
router.delete('/:id', (req, res) => {
    const index = ordenesCompra.findIndex(o => o.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ mensaje: 'Orden de compra no encontrada' });
    }
    ordenesCompra.splice(index, 1);
    res.status(204).send();
});
exports.default = router;
