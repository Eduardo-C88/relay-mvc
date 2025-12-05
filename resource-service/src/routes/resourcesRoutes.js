// •    GET /resources → listar recursos (com filtros: categoria, localização, etc.)
// •    GET /resources/:id → detalhe de um recurso
// •    POST /resources → criar recurso
// •    PUT /resources/:id → editar recurso
// •    DELETE /resources/:id → apagar recurso
// •    POST /resources/requests → criar pedido de recurso (ex.: “preciso de uma calculadora científica”)
// •    GET /resources/requests → listar pedidos feitos por utilizadores
// •    GET /resources/requests/:id → detalhe de um pedido

const express = require('express');
const resourcesController = require('../controllers/resourcesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.post('/createResource', resourcesController.createResource);

module.exports = router;