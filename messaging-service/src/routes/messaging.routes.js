const router = require("express").Router();
const controller = require("../controllers/messaging.controller");

router.get("/conversations", controller.getConversations);
router.get("/conversations/:id/messages", controller.getMessages);
router.post("/conversations/:id/messages", controller.sendMessage);

module.exports = router;
