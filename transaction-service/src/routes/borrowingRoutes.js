const express = require('express');
const borrowingController = require('../controllers/borrowingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post("/:id", borrowingController.createBorrowReq);
// Owner approves
router.post("/:id/approve", borrowingController.approveBorrowReq);
// Owner rejects
router.post("/:id/reject", borrowingController.rejectBorrowReq);
// // User returns item
// router.post("/:id/return", borrowingController.returnBorrowedItem);
// // Owner confirms return
// router.post("/:id/confirmReturn", borrowingController.confirmReturnByOwner);

// Get own borrowings for a user
router.get("/history", borrowingController.getBorrowingsHistory);

// Get all borrowings for a user as moderator/admin
router.get("/:id/history", roleMiddleware.authorizeRole([2, 3]), borrowingController.getUserBorrowings);
// Get all borrowings (admin/moderator)
router.get("/all", roleMiddleware.authorizeRole([2, 3]), borrowingController.getAllBorrowings);

module.exports = router;