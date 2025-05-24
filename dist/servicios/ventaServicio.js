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
exports.crearVenta = void 0;
const client_1 = require("@prisma/client");
const ordenCompraServicio_1 = require("./ordenCompraServicio");
const prisma = new client_1.PrismaClient();
const crearVenta = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const venta = yield prisma.venta.create({
            data: {
                nroVenta: Date.now(),
                fechaVenta: data.fechaVenta,
                montoTotalVenta: data.montoTotalVenta,
            },
        });
        const crearArticuloVenta = (nroVenta, articulo) => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.articuloVenta.create({
                data: {
                    VentaId: nroVenta,
                    ArticuloId: articulo.articuloId,
                    cantidadArticulo: articulo.cantidad,
                },
            });
        });
        for (const articulo of data.articulos) {
            yield crearArticuloVenta(venta.nroVenta, articulo);
            yield (0, ordenCompraServicio_1.generarOrdenCompra)(articulo.articuloId);
        }
        return venta;
    }));
});
exports.crearVenta = crearVenta;
