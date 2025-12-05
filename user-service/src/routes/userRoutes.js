const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes defined in this router
router.use(authMiddleware.authenticateToken);
router.get('/me', userController.getUserProfile);
router.put('/me', userController.updateUserProfile);
router.put('/:id/role', roleMiddleware.authorizeRole([3]), userController.changeUserRole);

// router.post('/addUni', roleMiddleware.authorizeRole([2, 3]), userController.addUniversity);
// router.post('/addCourse', roleMiddleware.authorizeRole([2, 3]), userController.addCourse);

module.exports = router;