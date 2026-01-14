const express = require("express");
const purchasesController = require("../controllers/purchasesController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post("/purchase/:resourceId", purchasesController.createPurchase);
// // Seller appoves
router.post("/purchase/:resourceId/approve", purchasesController.approvePurchase);
// // Seller rejects
router.post("/purchase/:resourceId/reject", purchasesController.rejectPurchase);
// // // Complete transaction (buyer confirms receipt)
// router.post("/:resourceId/complete", purchasesController.completeTransaction);
// // Get own purchases for a user
router.get("/purchase/history", purchasesController.getPurchasesHistory);

// Get all purchases for a user as moderator/admin
router.get(
  "/purchase/:id/history",
  roleMiddleware.authorizeRole([2, 3]),
  purchasesController.getUserPurchases
);
// Get all purchases (admin/moderator)
router.get(
  "/purchase/all",
  roleMiddleware.authorizeRole([2, 3]),
  purchasesController.getAllPurchases
);

module.exports = router;
