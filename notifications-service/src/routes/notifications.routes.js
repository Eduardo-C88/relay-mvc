const router = require("express").Router();
const controller = require("../controllers/notifications.controller");

router.get("/notifications", controller.getNotifications);
router.patch("/notifications/:id/read", controller.markAsRead);
router.post("/internal/notify", controller.internalNotify);

module.exports = router;
