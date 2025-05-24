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
exports.generarOrdenCompra = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generarOrdenCompra = (articuloId) => __awaiter(void 0, void 0, void 0, function* () {
    const modeloLoteFijo = yield prisma.modeloLoteFijo.findUnique({
        where: { articuloId },
    });
    if (modeloLoteFijo) {
        const articuloData = yield prisma.articulo.findUnique({
            where: { codArticulo: articuloId },
        });
        if (articuloData &&
            articuloData.stockActual >= modeloLoteFijo.puntoPedido) {
            const ordenesExistentes = yield prisma.ordenCompra.findMany({
                where: {
                    detalles: {
                        some: { articuloId },
                    },
                    ordenEstado: {
                        nombreEstadoOrden: { in: ["Pendiente", "Enviada"] },
                    },
                },
            });
            if (ordenesExistentes.length > 0) {
                throw new Error(`Ya existe una Orden de Compra activa (Pendiente o Enviada) para el artículo con ID ${articuloId}`);
            }
            const proveedorPredeterminado = yield prisma.proveedorArticulo.findFirst({
                where: {
                    articuloId,
                    predeterminado: true,
                },
            });
            if (!proveedorPredeterminado) {
                throw new Error(`No se encontró un proveedor predeterminado para el artículo con ID ${articuloId}`);
            }
            const ultimaOrden = yield prisma.ordenCompra.findFirst({
                orderBy: { numOrdenCompra: 'desc' },
            });
            const nuevoNumOrdenCompra = ((ultimaOrden === null || ultimaOrden === void 0 ? void 0 : ultimaOrden.numOrdenCompra) || 0) + 1;
            yield prisma.ordenCompra.create({
                data: {
                    numOrdenCompra: nuevoNumOrdenCompra,
                    tamanoLote: modeloLoteFijo.loteOptimo,
                    montoOrden: articuloData.costoCompra,
                    proveedorId: proveedorPredeterminado.proveedorId,
                    ordenEstadoId: 1,
                    detalles: {
                        create: [
                            {
                                articuloId,
                            },
                        ],
                    },
                },
            });
        }
    }
});
exports.generarOrdenCompra = generarOrdenCompra;
