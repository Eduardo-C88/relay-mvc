const express = require("express");
const purchasesController = require("../controllers/purchasesController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post("/", purchasesController.createPurchase);
// Seller appoves
router.post("/:purchaseId/approve", purchasesController.approveTransaction);
// Seller rejects
router.post("/:id/reject", purchasesController.rejectTransaction);
// // Complete transaction (buyer confirms receipt)
router.post("/:id/complete", purchasesController.completeTransaction);

// Get own purchases for a user
router.get("/history", purchasesController.getPurchasesHistory);

// Get all purchases for a user as moderator/admin
router.get(
  "/:id/history",
  roleMiddleware.authorizeRole([2, 3]),
  purchasesController.getUserPurchases
);
// Get all purchases (admin/moderator)
router.get(
  "/all",
  roleMiddleware.authorizeRole([2, 3]),
  purchasesController.getAllPurchases
);

module.exports = router;
