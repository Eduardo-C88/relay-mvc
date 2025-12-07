const express = require('express');
const purchasesController = require('../controllers/purchasesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post("/purchase", purchasesController.createPurchaseReq);
// Seller appoves
router.post("/purchase/:id/approve", purchasesController.approveTransaction);
// Seller rejects
router.post("/purchase/:id/reject", purchasesController.rejectTransaction);
// Complete transaction (buyer confirms receipt)
router.post("/purchase/:id/complete", purchasesController.completeTransaction);

// Get own purchases for a user
router.get("/purchase/history", purchasesController.getPurchasesHistory);

// Get all purchases for a user as moderator/admin
router.get("/purchase/:id/history", roleMiddleware.authorizeRole([2, 3]), purchasesController.getUserPurchases);
// Get all purchases (admin/moderator)
router.get("/purchases/all", roleMiddleware.authorizeRole([2, 3]), purchasesController.getAllPurchases);

module.exports = router;