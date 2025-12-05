// •    GET /resources → listar recursos (com filtros: categoria, localização, etc.)
// •    GET /resources/:id → detalhe de um recurso
// •    POST /resources → criar recurso
// •    PUT /resources/:id → editar recurso
// •    DELETE /resources/:id → apagar recurso
// •    POST /resources/requests → criar pedido de recurso (ex.: “preciso de uma calculadora científica”)
// •    GET /resources/requests → listar pedidos feitos por utilizadores
// •    GET /resources/requests/:id → detalhe de um pedido

const express = require('express');
const { prisma } = require('../models/prismaClient');
const resourcesController = require('../controllers/resourcesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.post('/resources')

module.exports = router;