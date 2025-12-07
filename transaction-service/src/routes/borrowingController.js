const express = require('express');
const borrowingController = require('../controllers/borrowingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticateToken);

router.post("/borrow", borrowingController.createBorrowReq);
// Owner approves
router.post("/borrow/:id/approve", borrowingController.approveBorrowReq);
// Owner rejects
router.post("/borrow/:id/reject", borrowingController.rejectBorrowReq);
// User returns item
router.post("/borrow/:id/return", borrowingController.returnBorrowedItem);
// Owner confirms return
router.post("/borrow/:id/confirmReturn", borrowingController.confirmReturnByOwner);

// Get own borrowings for a user
router.get("/borrow/history", borrowingController.getBorrowingsHistory);

// Get all borrowings for a user as moderator/admin
router.get("/borrow/:id/history", roleMiddleware.authorizeRole([2, 3]), borrowingController.getUserBorrowings);
// Get all borrowings (admin/moderator)
router.get("/borrowings/all", roleMiddleware.authorizeRole([2, 3]), borrowingController.getAllBorrowings);

module.exports = router;