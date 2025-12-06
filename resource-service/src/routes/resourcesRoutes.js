// •    GET /resources → listar recursos (com filtros: categoria, localização, etc.)
// •    GET /resources/:id → detalhe de um recurso
// •    POST /resources → criar recurso
// •    PUT /resources/:id → editar recurso
// •    DELETE /resources/:id → apagar recurso
// •    POST /resources/requests → criar pedido de recurso (ex.: “preciso de uma calculadora científica”)
// •    GET /resources/requests → listar pedidos feitos por utilizadores
// •    GET /resources/requests/:id → detalhe de um pedido

const express = require("express");
const resourcesController = require("../controllers/resourcesController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware.authenticateToken);
router.post("/create", resourcesController.createResource);
router.put("/edit/:id", resourcesController.editResource);
router.delete("/delete/:id", resourcesController.deleteResource);
router.get("/all", resourcesController.getAllResources);
router.get("/filter", resourcesController.filterResources);
router.get("/:id", resourcesController.getResourceById);

// Higher privileged routes can have additional role checks
router.post("/createCategory", roleMiddleware.authorizeRole([2, 3]), resourcesController.createCategory);

module.exports = router;
